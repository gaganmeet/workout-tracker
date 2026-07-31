export interface DraftExercise {
  tempId: string
  exerciseId: string
  exerciseName: string
  targetSets: number | null
  targetRepsMin: number | null
  targetRepsMax: number | null
  targetRpe: number | null
  notes: string
}

export interface DraftDay {
  tempId: string
  name: string
  exercises: DraftExercise[]
}

export interface DraftPlan {
  id?: string
  name: string
  description: string
  days: DraftDay[]
}

export interface SavePlanPayload {
  id?: string
  name: string
  description?: string
  assign_client_id?: string
  days: {
    name: string
    day_order: number
    exercises: {
      exercise_id: string
      exercise_order: number
      target_sets: number | null
      target_reps_min: number | null
      target_reps_max: number | null
      target_rpe: number | null
      notes: string | null
    }[]
  }[]
}

export function draftToPayload(draft: DraftPlan, assignClientId?: string): SavePlanPayload {
  return {
    id: draft.id,
    name: draft.name,
    description: draft.description || undefined,
    assign_client_id: assignClientId,
    days: draft.days.map((day, dayIndex) => ({
      name: day.name,
      day_order: dayIndex,
      exercises: day.exercises.map((exercise, exerciseIndex) => ({
        exercise_id: exercise.exerciseId,
        exercise_order: exerciseIndex,
        target_sets: exercise.targetSets,
        target_reps_min: exercise.targetRepsMin,
        target_reps_max: exercise.targetRepsMax,
        target_rpe: exercise.targetRpe,
        notes: exercise.notes || null,
      })),
    })),
  }
}
