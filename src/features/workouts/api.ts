import { supabase } from '@/lib/supabase/client'
import type { Exercise, Gym, WorkoutExercise, WorkoutSession, WorkoutSet } from '@/types/domain'

export type SetRow = WorkoutSet
export type WorkoutExerciseWithDetails = WorkoutExercise & { exercises: Exercise; sets: SetRow[] }
export type GymRef = Pick<Gym, 'id' | 'name'> | null
export type SessionDetail = WorkoutSession & {
  workout_exercises: WorkoutExerciseWithDetails[]
  gyms: GymRef
}
export type SessionSummary = WorkoutSession & { gyms: GymRef }

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, workout_exercises(*, exercises(*), sets(*)), gyms(id, name)')
    .eq('id', sessionId)
    .order('exercise_order', { referencedTable: 'workout_exercises' })
    .order('set_order', { referencedTable: 'workout_exercises.sets' })
    .maybeSingle()
  if (error) throw error
  return data as unknown as SessionDetail | null
}

export async function fetchSessionHistory(userId: string): Promise<SessionSummary[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, gyms(id, name)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  if (error) throw error
  return data as unknown as SessionSummary[]
}

interface PlanDayExerciseSeed {
  exercise_id: string
  exercise_order: number
  target_sets: number | null
  plan_day_exercise_id: string
}

export async function createSessionFromPlanDay(
  userId: string,
  planDayId: string,
  gymId: string | null,
): Promise<string> {
  const { data: dayExercises, error: dayError } = await supabase
    .from('plan_day_exercises')
    .select('id, exercise_id, exercise_order, target_sets')
    .eq('plan_day_id', planDayId)
    .order('exercise_order')
  if (dayError) throw dayError

  const { data: planDay, error: planDayError } = await supabase
    .from('plan_days')
    .select('name')
    .eq('id', planDayId)
    .single()
  if (planDayError) throw planDayError

  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, plan_day_id: planDayId, name: planDay.name, gym_id: gymId })
    .select('id')
    .single()
  if (sessionError) throw sessionError

  const seeds: PlanDayExerciseSeed[] = dayExercises.map((exercise) => ({
    exercise_id: exercise.exercise_id,
    exercise_order: exercise.exercise_order,
    target_sets: exercise.target_sets,
    plan_day_exercise_id: exercise.id,
  }))

  for (const seed of seeds) {
    const { data: workoutExercise, error: weError } = await supabase
      .from('workout_exercises')
      .insert({
        workout_session_id: session.id,
        exercise_id: seed.exercise_id,
        plan_day_exercise_id: seed.plan_day_exercise_id,
        exercise_order: seed.exercise_order,
      })
      .select('id')
      .single()
    if (weError) throw weError

    const setCount = seed.target_sets ?? 3
    const setRows = Array.from({ length: setCount }, (_, index) => ({
      workout_exercise_id: workoutExercise.id,
      set_order: index,
    }))
    if (setRows.length > 0) {
      const { error: setsError } = await supabase.from('sets').insert(setRows)
      if (setsError) throw setsError
    }
  }

  return session.id
}

export async function createAdHocSession(userId: string, gymId: string | null): Promise<string> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, name: 'Ad-hoc Workout', gym_id: gymId })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateSessionGym(sessionId: string, gymId: string | null): Promise<void> {
  const { error } = await supabase.from('workout_sessions').update({ gym_id: gymId }).eq('id', sessionId)
  if (error) throw error
}

export async function addWorkoutExercise(
  sessionId: string,
  exerciseId: string,
  order: number,
): Promise<WorkoutExerciseWithDetails> {
  const { data: workoutExercise, error } = await supabase
    .from('workout_exercises')
    .insert({ workout_session_id: sessionId, exercise_id: exerciseId, exercise_order: order })
    .select('*, exercises(*)')
    .single()
  if (error) throw error

  const { data: set, error: setError } = await supabase
    .from('sets')
    .insert({ workout_exercise_id: workoutExercise.id, set_order: 0 })
    .select('*')
    .single()
  if (setError) throw setError

  return { ...workoutExercise, sets: [set] } as unknown as WorkoutExerciseWithDetails
}

export async function addSet(workoutExerciseId: string, setOrder: number): Promise<SetRow> {
  const { data, error } = await supabase
    .from('sets')
    .insert({ workout_exercise_id: workoutExerciseId, set_order: setOrder })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export interface SetPatch {
  weight?: number | null
  reps?: number | null
  rpe?: number | null
  completed?: boolean
  is_warmup?: boolean
}

export async function updateSet(setId: string, patch: SetPatch): Promise<void> {
  const payload: SetPatch & { completed_at?: string | null } = { ...patch }
  if (patch.completed !== undefined) {
    payload.completed_at = patch.completed ? new Date().toISOString() : null
  }
  const { error } = await supabase.from('sets').update(payload).eq('id', setId)
  if (error) throw error
}

export async function deleteSet(setId: string): Promise<void> {
  const { error } = await supabase.from('sets').delete().eq('id', setId)
  if (error) throw error
}

export async function updateWorkoutExerciseNotes(
  workoutExerciseId: string,
  notes: string,
): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .update({ notes: notes.trim() || null })
    .eq('id', workoutExerciseId)
  if (error) throw error
}

export async function finishSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId)
  if (error) throw error
}

export interface PreviousSet {
  weight: number | null
  reps: number | null
  rpe: number | null
}

// Most recent OTHER session where this user logged this exercise, ordered
// by set_order, so a given set row's index lines up with "the same set last
// time" -- used to show last time's numbers as placeholders while logging.
// When the current session has a gym, prefer the most recent session at that
// SAME gym first (different gyms can mean different machines/plates, so a
// cross-gym "last time" can be misleadingly off) and only fall back to the
// most recent session regardless of gym if there's no history there yet.
//
// Queries FROM workout_sessions (not workout_exercises) so `.order()` sorts
// by that table's own started_at column directly. Ordering via
// `{ referencedTable }` only reorders a *nested* array within an embedded
// resource -- it does not drive which row a top-level `.limit()` keeps, so
// querying from the child table with the parent embedded silently returned
// an arbitrary session instead of the most recent one.
async function findPreviousSessionExercise(
  userId: string,
  exerciseId: string,
  excludeSessionId: string,
  gymId: string | null,
) {
  let query = supabase
    .from('workout_sessions')
    .select('workout_exercises!inner(id, exercise_id)')
    .eq('user_id', userId)
    .eq('workout_exercises.exercise_id', exerciseId)
    .neq('id', excludeSessionId)
    .order('started_at', { ascending: false })
    .limit(1)
  if (gymId) query = query.eq('gym_id', gymId)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchPreviousSets(
  userId: string,
  exerciseId: string,
  excludeSessionId: string,
  gymId: string | null,
): Promise<PreviousSet[]> {
  let previousSessions = gymId
    ? await findPreviousSessionExercise(userId, exerciseId, excludeSessionId, gymId)
    : []
  if (!previousSessions || previousSessions.length === 0) {
    previousSessions = await findPreviousSessionExercise(userId, exerciseId, excludeSessionId, null)
  }
  if (!previousSessions || previousSessions.length === 0) return []

  const previousWorkoutExerciseId = previousSessions[0].workout_exercises[0].id

  const { data: sets, error: setsError } = await supabase
    .from('sets')
    .select('weight, reps, rpe')
    .eq('workout_exercise_id', previousWorkoutExerciseId)
    .order('set_order')
  if (setsError) throw setsError
  return sets
}
