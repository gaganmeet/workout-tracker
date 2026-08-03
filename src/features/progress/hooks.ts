import { useQuery } from '@tanstack/react-query'
import { fetchExerciseProgress, type GymFilter } from './api'

export function useExerciseProgress(
  userId: string | undefined,
  exerciseId: string | undefined,
  gymFilter: GymFilter = 'all',
) {
  return useQuery({
    queryKey: ['progress', 'exercise', userId, exerciseId, gymFilter],
    queryFn: () => fetchExerciseProgress(userId!, exerciseId!, gymFilter),
    enabled: !!userId && !!exerciseId,
  })
}
