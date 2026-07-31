import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignPlanToClient,
  cancelLink,
  fetchApprovedClients,
  fetchClientProfile,
  fetchClientSessions,
  fetchMyLinks,
  fetchPendingRequests,
  fetchPlansAssignedToClient,
  respondToRequest,
  searchCoaches,
  sendLinkRequest,
} from './api'

export function useCoachSearch(query: string) {
  return useQuery({
    queryKey: ['coaches', 'search', query],
    queryFn: () => searchCoaches(query),
    enabled: query.trim().length > 0,
  })
}

export function useMyLinks(clientId: string | undefined) {
  return useQuery({
    queryKey: ['coachLinks', 'mine', clientId],
    queryFn: () => fetchMyLinks(clientId!),
    enabled: !!clientId,
  })
}

export function useSendLinkRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ coachId, clientId }: { coachId: string; clientId: string }) =>
      sendLinkRequest(coachId, clientId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coachLinks', 'mine'] })
    },
  })
}

export function useCancelLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (linkId: string) => cancelLink(linkId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coachLinks', 'mine'] })
    },
  })
}

export function usePendingRequests(coachId: string | undefined) {
  return useQuery({
    queryKey: ['coachLinks', 'pending', coachId],
    queryFn: () => fetchPendingRequests(coachId!),
    enabled: !!coachId,
  })
}

export function useApprovedClients(coachId: string | undefined) {
  return useQuery({
    queryKey: ['coachLinks', 'approved', coachId],
    queryFn: () => fetchApprovedClients(coachId!),
    enabled: !!coachId,
  })
}

export function useRespondToRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ linkId, status }: { linkId: string; status: 'approved' | 'rejected' }) =>
      respondToRequest(linkId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coachLinks'] })
    },
  })
}

export function useClientProfile(clientId: string | undefined) {
  return useQuery({
    queryKey: ['coaching', 'clientProfile', clientId],
    queryFn: () => fetchClientProfile(clientId!),
    enabled: !!clientId,
  })
}

export function useClientSessions(clientId: string | undefined) {
  return useQuery({
    queryKey: ['coaching', 'clientSessions', clientId],
    queryFn: () => fetchClientSessions(clientId!),
    enabled: !!clientId,
  })
}

export function usePlansAssignedToClient(coachId: string | undefined, clientId: string | undefined) {
  return useQuery({
    queryKey: ['coaching', 'assignedPlans', coachId, clientId],
    queryFn: () => fetchPlansAssignedToClient(coachId!, clientId!),
    enabled: !!coachId && !!clientId,
  })
}

export function useAssignPlanToClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      planId,
      clientId,
      assignedBy,
    }: {
      planId: string
      clientId: string
      assignedBy: string
    }) => assignPlanToClient(planId, clientId, assignedBy),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coaching', 'assignedPlans'] })
    },
  })
}
