import { supabase } from '@/lib/supabase/client'
import type { WeightUnit } from '@/types/domain'

export async function updateWeightUnit(profileId: string, weightUnit: WeightUnit): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ weight_unit: weightUnit })
    .eq('id', profileId)
  if (error) throw error
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function deleteOwnAccount(userId: string): Promise<void> {
  // storage.objects has no FK to auth.users -- Supabase deliberately blocks
  // direct SQL deletion of storage rows (a DB-level trigger, "use the
  // Storage API instead"), so delete_own_account() can never clean up an
  // avatar file even running as SECURITY DEFINER. Must happen client-side,
  // before the RPC below invalidates this session. Best-effort: a user who
  // never uploaded an avatar has nothing to remove, and that shouldn't ever
  // block the actually-important account deletion, so its result/error is
  // intentionally ignored.
  await supabase.storage.from('avatars').remove([userId])

  const { error } = await supabase.rpc('delete_own_account')
  if (error) throw error
}
