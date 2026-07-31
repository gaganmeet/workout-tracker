import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deletePlan,
  duplicatePlan,
  fetchAssignedPlans,
  fetchOwnPlans,
  fetchPlanDetail,
  savePlan,
} from './api'
import type { SavePlanPayload } from './types'

export function useOwnPlans(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['plans', 'own', ownerId],
    queryFn: () => fetchOwnPlans(ownerId!),
    enabled: !!ownerId,
  })
}

export function useAssignedPlans(clientId: string | undefined) {
  return useQuery({
    queryKey: ['plans', 'assigned', clientId],
    queryFn: () => fetchAssignedPlans(clientId!),
    enabled: !!clientId,
  })
}

export function usePlanDetail(planId: string | undefined) {
  return useQuery({
    queryKey: ['plans', 'detail', planId],
    queryFn: () => fetchPlanDetail(planId!),
    enabled: !!planId,
  })
}

export function useSavePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SavePlanPayload) => savePlan(payload),
    onSuccess: (planId) => {
      void queryClient.invalidateQueries({ queryKey: ['plans'] })
      void queryClient.invalidateQueries({ queryKey: ['plans', 'detail', planId] })
    },
  })
}

export function useDuplicatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => duplicatePlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => deletePlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}
