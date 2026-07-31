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

export async function fetchExerciseProgress(
  userId: string,
  exerciseId: string,
): Promise<SessionPoint[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, started_at, workout_exercises!inner(sets(weight, reps, completed))')
    .eq('user_id', userId)
    .eq('workout_exercises.exercise_id', exerciseId)
    .order('started_at', { ascending: true })
  if (error) throw error

  const sessions = data as unknown as RawSession[]

  return sessions.map((session) => {
    const completedSets = session.workout_exercises
      .flatMap((we) => we.sets)
      .filter((set) => set.completed && set.weight != null && set.reps != null)

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
