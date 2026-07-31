import { supabase } from '@/lib/supabase/client'
import type { EquipmentType, Exercise, MuscleGroup } from '@/types/domain'

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase.from('exercises').select('*').order('name')
  if (error) throw error
  return data
}

export async function fetchExercise(id: string): Promise<Exercise | null> {
  const { data, error } = await supabase.from('exercises').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export interface CreateExerciseInput {
  name: string
  muscleGroup: MuscleGroup | null
  equipment: EquipmentType | null
  createdBy: string
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name: input.name,
      muscle_group: input.muscleGroup,
      equipment: input.equipment,
      created_by: input.createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
