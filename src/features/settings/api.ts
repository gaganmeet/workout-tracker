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

export async function deleteOwnAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_own_account')
  if (error) throw error
}
