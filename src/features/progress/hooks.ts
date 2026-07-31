import { useQuery } from '@tanstack/react-query'
import { fetchExerciseProgress } from './api'

export function useExerciseProgress(userId: string | undefined, exerciseId: string | undefined) {
  return useQuery({
    queryKey: ['progress', 'exercise', userId, exerciseId],
    queryFn: () => fetchExerciseProgress(userId!, exerciseId!),
    enabled: !!userId && !!exerciseId,
  })
}
