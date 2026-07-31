import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addSet,
  addWorkoutExercise,
  createAdHocSession,
  createSessionFromPlanDay,
  deleteSession,
  deleteSet,
  fetchSessionDetail,
  fetchSessionHistory,
  finishSession,
  updateSet,
  updateWorkoutExerciseNotes,
  type SetPatch,
} from './api'

export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['workoutSessions', sessionId],
    queryFn: () => fetchSessionDetail(sessionId!),
    enabled: !!sessionId,
  })
}

export function useSessionHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['workoutSessions', 'history', userId],
    queryFn: () => fetchSessionHistory(userId!),
    enabled: !!userId,
  })
}

export function useCreateSessionFromPlanDay() {
  return useMutation({
    mutationFn: ({ userId, planDayId }: { userId: string; planDayId: string }) =>
      createSessionFromPlanDay(userId, planDayId),
  })
}

export function useCreateAdHocSession() {
  return useMutation({
    mutationFn: (userId: string) => createAdHocSession(userId),
  })
}

export function useAddWorkoutExercise(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ exerciseId, order }: { exerciseId: string; order: number }) =>
      addWorkoutExercise(sessionId, exerciseId, order),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workoutSessions', sessionId] })
    },
  })
}

export function useAddSet(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workoutExerciseId, setOrder }: { workoutExerciseId: string; setOrder: number }) =>
      addSet(workoutExerciseId, setOrder),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workoutSessions', sessionId] })
    },
  })
}

export function useUpdateSet(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ setId, patch }: { setId: string; patch: SetPatch }) => updateSet(setId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workoutSessions', sessionId] })
    },
  })
}

export function useDeleteSet(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (setId: string) => deleteSet(setId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workoutSessions', sessionId] })
    },
  })
}

export function useFinishSession(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => finishSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workoutSessions', sessionId] })
      void queryClient.invalidateQueries({ queryKey: ['workoutSessions', 'history'] })
    },
  })
}

export function useUpdateWorkoutExerciseNotes(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workoutExerciseId, notes }: { workoutExerciseId: string; notes: string }) =>
      updateWorkoutExerciseNotes(workoutExerciseId, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workoutSessions', sessionId] })
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workoutSessions'] })
    },
  })
}
