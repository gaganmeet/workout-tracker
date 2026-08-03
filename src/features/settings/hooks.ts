import { useMutation } from '@tanstack/react-query'
import { deleteOwnAccount, updatePassword, updateWeightUnit } from './api'
import type { WeightUnit } from '@/types/domain'

export function useUpdateWeightUnit() {
  return useMutation({
    mutationFn: ({ profileId, weightUnit }: { profileId: string; weightUnit: WeightUnit }) =>
      updateWeightUnit(profileId, weightUnit),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) => updatePassword(newPassword),
  })
}

export function useDeleteOwnAccount() {
  return useMutation({
    mutationFn: (userId: string) => deleteOwnAccount(userId),
  })
}
