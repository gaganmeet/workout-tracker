import { supabase } from '@/lib/supabase/client'
import type { Gym } from '@/types/domain'

export async function fetchGyms(ownerId: string): Promise<Gym[]> {
  const { data, error } = await supabase.from('gyms').select('*').eq('owner_id', ownerId).order('name')
  if (error) throw error
  return data
}

export async function createGym(ownerId: string, name: string): Promise<Gym> {
  const { data, error } = await supabase
    .from('gyms')
    .insert({ owner_id: ownerId, name: name.trim() })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteGym(gymId: string): Promise<void> {
  const { error } = await supabase.from('gyms').delete().eq('id', gymId)
  if (error) throw error
}
