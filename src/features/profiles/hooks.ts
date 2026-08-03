import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import {
  fetchActivity,
  fetchProfile,
  fetchProfileStars,
  removeAvatar,
  starProfile,
  unstarProfile,
  updateProfileBio,
  uploadAvatar,
} from './api'

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profiles', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  })
}

export function useUpdateProfileBio(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bio: string) => updateProfileBio(userId, bio),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles', userId] })
    },
  })
}

export function useUploadAvatar(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(userId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles', userId] })
    },
  })
}

export function useRemoveAvatar(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => removeAvatar(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles', userId] })
    },
  })
}

const ACTIVITY_DAYS = 371 // 53 weeks, matches the heatmap grid

export function useActivity(userId: string | undefined) {
  return useQuery({
    queryKey: ['profiles', 'activity', userId],
    queryFn: () => fetchActivity(userId!, subDays(new Date(), ACTIVITY_DAYS).toISOString()),
    enabled: !!userId,
  })
}

export function useProfileStars(profileId: string | undefined) {
  return useQuery({
    queryKey: ['profiles', 'stars', profileId],
    queryFn: () => fetchProfileStars(profileId!),
    enabled: !!profileId,
  })
}

export function useToggleProfileStar(profileId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, isStarred }: { userId: string; isStarred: boolean }) =>
      isStarred ? unstarProfile(userId, profileId) : starProfile(userId, profileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles', 'stars', profileId] })
    },
  })
}
