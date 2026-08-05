import { useQuery } from '@tanstack/react-query'
import { fetchExerciseProgress, fetchRecentExercises, type GymFilter } from './api'

export function useRecentExercises(userId: string | undefined) {
  return useQuery({
    queryKey: ['progress', 'recent-exercises', userId],
    queryFn: () => fetchRecentExercises(userId!),
    enabled: !!userId,
  })
}

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
