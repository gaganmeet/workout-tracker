import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createExercise,
  fetchExercise,
  fetchExercises,
  setExerciseVideoUrl,
  type CreateExerciseInput,
} from './api'

export function useExercises() {
  return useQuery({
    queryKey: ['exercises', 'list'],
    queryFn: fetchExercises,
  })
}

export function useExercise(id: string | undefined) {
  return useQuery({
    queryKey: ['exercises', 'detail', id],
    queryFn: () => fetchExercise(id!),
    enabled: !!id,
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateExerciseInput) => createExercise(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exercises', 'list'] })
    },
  })
}

export function useSetExerciseVideoUrl() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ exerciseId, videoUrl }: { exerciseId: string; videoUrl: string }) =>
      setExerciseVideoUrl(exerciseId, videoUrl),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exercises'] })
    },
  })
}
