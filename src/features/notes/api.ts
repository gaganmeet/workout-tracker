import { supabase } from '@/lib/supabase/client'
import type { ExerciseNote } from '@/types/domain'

export async function fetchNotesForPlanDayExercise(planDayExerciseId: string): Promise<ExerciseNote[]> {
  const { data, error } = await supabase
    .from('exercise_notes')
    .select('*')
    .eq('plan_day_exercise_id', planDayExerciseId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchNotesForWorkoutExercise(workoutExerciseId: string): Promise<ExerciseNote[]> {
  const { data, error } = await supabase
    .from('exercise_notes')
    .select('*')
    .eq('workout_exercise_id', workoutExerciseId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchNotesForExercise(exerciseId: string, clientId: string): Promise<ExerciseNote[]> {
  const { data, error } = await supabase
    .from('exercise_notes')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export interface CreateNoteInput {
  coachId: string
  clientId: string
  exerciseId: string
  planDayExerciseId?: string
  workoutExerciseId?: string
  note: string
}

export async function createNote(input: CreateNoteInput): Promise<ExerciseNote> {
  const { data, error } = await supabase
    .from('exercise_notes')
    .insert({
      coach_id: input.coachId,
      client_id: input.clientId,
      exercise_id: input.exerciseId,
      plan_day_exercise_id: input.planDayExerciseId ?? null,
      workout_exercise_id: input.workoutExerciseId ?? null,
      note: input.note,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from('exercise_notes').delete().eq('id', noteId)
  if (error) throw error
}
