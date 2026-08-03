import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/types/domain'

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_BYTES = 5 * 1024 * 1024

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

// Path is fixed to the user's own id (no extension -- Storage tracks
// content-type from the upload itself), so upsert:true always overwrites
// the previous avatar in place instead of accumulating multiple objects.
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('Image must be under 5MB')
  }
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(userId, file, { upsert: true, contentType: file.type })
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
