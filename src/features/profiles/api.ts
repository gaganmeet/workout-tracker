import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/types/domain'

const AVATAR_BUCKET = 'avatars'
const MAX_SOURCE_BYTES = 25 * 1024 * 1024 // sanity cap before we even try to decode
const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // backstop after compression, should basically never trip
const MAX_AVATAR_DIMENSION = 512
const JPEG_QUALITY = 0.85

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfileBio(userId: string, bio: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ bio: bio.trim() || null })
    .eq('id', userId)
  if (error) throw error
}

// Resize to avatar-appropriate dimensions and re-encode as JPEG using the
// Canvas API -- no extra dependency needed for what a few lines of native
// browser APIs already do. A phone photo (often 3-5MB) routinely comes out
// under 100KB at 512px, so the old flat "reject over 5MB" limit was mostly
// just rejecting normal photos rather than actually protecting anything.
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to compress image')
  // Flatten transparency onto white -- avatars render as opaque circles, and
  // converting a transparent PNG straight to JPEG would otherwise turn
  // transparent pixels black.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to compress image'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

// Path is fixed to the user's own id (no extension -- Storage tracks
// content-type from the upload itself), so upsert:true always overwrites
// the previous avatar in place instead of accumulating multiple objects.
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Image is too large')
  }
  const compressed = await compressImage(file)
  if (compressed.size > MAX_AVATAR_BYTES) {
    throw new Error('Image is too large even after compression')
  }

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(userId, compressed, { upsert: true, contentType: 'image/jpeg' })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(userId)
  // Cache-bust: the object path (hence its default URL) never changes on
  // replacement, so without a query param the browser/CDN would keep
  // serving the old cached image after a new upload.
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
  if (updateError) throw updateError

  return avatarUrl
}

export async function removeAvatar(userId: string): Promise<void> {
  const { error: removeError } = await supabase.storage.from(AVATAR_BUCKET).remove([userId])
  if (removeError) throw removeError

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId)
  if (updateError) throw updateError
}

export interface DayActivity {
  date: string
  count: number
}

// Routed through a SECURITY DEFINER RPC rather than a direct table query:
// workout_sessions RLS only allows the owner or their coach to read raw
// rows, but the activity heatmap needs to work on ANY user's public profile
// page. The RPC bypasses RLS internally but only ever returns a (day,
// count) aggregate -- no session name/notes leak to an unrelated viewer.
// Trade-off: grouping runs in the database's UTC day, not the viewer's
// local day, so a workout logged right at a local midnight boundary can
// land a day off -- acceptable for a browsing feature, not worth a second
// code path just for the owner's own view.
export async function fetchActivity(userId: string, sinceIso: string): Promise<DayActivity[]> {
  const { data, error } = await supabase.rpc('get_workout_activity', {
    p_user_id: userId,
    p_since: sinceIso,
  })
  if (error) throw error
  return data.map((row) => ({ date: row.day, count: Number(row.count) }))
}

export type StarRef = { user_id: string }

export async function fetchProfileStars(profileId: string): Promise<StarRef[]> {
  const { data, error } = await supabase
    .from('profile_stars')
    .select('user_id')
    .eq('profile_id', profileId)
  if (error) throw error
  return data
}

export async function starProfile(userId: string, profileId: string): Promise<void> {
  const { error } = await supabase.from('profile_stars').insert({ user_id: userId, profile_id: profileId })
  if (error) throw error
}

export async function unstarProfile(userId: string, profileId: string): Promise<void> {
  const { error } = await supabase
    .from('profile_stars')
    .delete()
    .eq('user_id', userId)
    .eq('profile_id', profileId)
  if (error) throw error
}
