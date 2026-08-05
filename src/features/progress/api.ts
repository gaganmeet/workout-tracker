import { supabase } from '@/lib/supabase/client'

export interface SessionPoint {
  sessionId: string
  date: string
  topWeight: number | null
  estOneRepMax: number | null
  volume: number
}

interface RawSet {
  weight: number | null
  reps: number | null
  completed: boolean
  is_warmup: boolean
}

interface RawWorkoutExercise {
  sets: RawSet[]
}

interface RawSession {
  id: string
  started_at: string
  workout_exercises: RawWorkoutExercise[]
}

// Epley formula: 1RM = weight * (1 + reps / 30)
function estimateOneRepMax(weight: number, reps: number): number {
  return weight * (1 + reps / 30)
}

export interface RecentExercise {
  id: string
  name: string
}

interface RawRecentSession {
  workout_exercises: { exercises: RecentExercise | null }[]
}

// Most recently trained exercises, most recent first, deduped. Scans the
// last 25 sessions for distinct exercises rather than a dedicated grouped
// query -- ponytail: sessions with unusually low exercise variety could
// undershoot `limit`; widen the session window if that shows up in practice.
export async function fetchRecentExercises(userId: string, limit = 8): Promise<RecentExercise[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('workout_exercises(exercises(id, name))')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(25)
  if (error) throw error

  const sessions = data as unknown as RawRecentSession[]
  const seen = new Map<string, RecentExercise>()
  for (const session of sessions) {
    for (const { exercises: exercise } of session.workout_exercises) {
      if (!exercise || seen.has(exercise.id)) continue
      seen.set(exercise.id, exercise)
      if (seen.size >= limit) return [...seen.values()]
    }
  }
  return [...seen.values()]
}

export type GymFilter = 'all' | 'none' | string

export async function fetchExerciseProgress(
  userId: string,
  exerciseId: string,
  gymFilter: GymFilter,
): Promise<SessionPoint[]> {
  let query = supabase
    .from('workout_sessions')
    .select('id, started_at, workout_exercises!inner(sets(weight, reps, completed, is_warmup))')
    .eq('user_id', userId)
    .eq('workout_exercises.exercise_id', exerciseId)
    .order('started_at', { ascending: true })
  if (gymFilter === 'none') query = query.is('gym_id', null)
  else if (gymFilter !== 'all') query = query.eq('gym_id', gymFilter)
  const { data, error } = await query
  if (error) throw error

  const sessions = data as unknown as RawSession[]

  return sessions.map((session) => {
    const completedSets = session.workout_exercises
      .flatMap((we) => we.sets)
      .filter((set) => set.completed && !set.is_warmup && set.weight != null && set.reps != null)

    let topWeight: number | null = null
    let estOneRepMax: number | null = null
    let volume = 0

    for (const set of completedSets) {
      const weight = set.weight!
      const reps = set.reps!
      volume += weight * reps
      if (topWeight === null || weight > topWeight) topWeight = weight
      const oneRm = estimateOneRepMax(weight, reps)
      if (estOneRepMax === null || oneRm > estOneRepMax) estOneRepMax = oneRm
    }

    return {
      sessionId: session.id,
      date: session.started_at,
      topWeight,
      estOneRepMax: estOneRepMax === null ? null : Math.round(estOneRepMax),
      volume,
    }
  })
}
