import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createGym, deleteGym, fetchGyms } from './api'

export function useGyms(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['gyms', ownerId],
    queryFn: () => fetchGyms(ownerId!),
    enabled: !!ownerId,
  })
}

export function useCreateGym() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ownerId, name }: { ownerId: string; name: string }) => createGym(ownerId, name),
    onSuccess: (_data, { ownerId }) => {
      void queryClient.invalidateQueries({ queryKey: ['gyms', ownerId] })
    },
  })
}

export function useDeleteGym(ownerId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (gymId: string) => deleteGym(gymId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gyms', ownerId] })
    },
  })
}
