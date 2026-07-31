import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createNote,
  deleteNote,
  fetchNotesForExercise,
  fetchNotesForPlanDayExercise,
  fetchNotesForWorkoutExercise,
  type CreateNoteInput,
} from './api'

export function useNotesForPlanDayExercise(planDayExerciseId: string | undefined) {
  return useQuery({
    queryKey: ['notes', 'planDayExercise', planDayExerciseId],
    queryFn: () => fetchNotesForPlanDayExercise(planDayExerciseId!),
    enabled: !!planDayExerciseId,
  })
}

export function useNotesForWorkoutExercise(workoutExerciseId: string | undefined) {
  return useQuery({
    queryKey: ['notes', 'workoutExercise', workoutExerciseId],
    queryFn: () => fetchNotesForWorkoutExercise(workoutExerciseId!),
    enabled: !!workoutExerciseId,
  })
}

export function useNotesForExercise(exerciseId: string | undefined, clientId: string | undefined) {
  return useQuery({
    queryKey: ['notes', 'exercise', exerciseId, clientId],
    queryFn: () => fetchNotesForExercise(exerciseId!, clientId!),
    enabled: !!exerciseId && !!clientId,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
