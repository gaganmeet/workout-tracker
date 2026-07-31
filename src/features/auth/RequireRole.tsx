import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { UserRole } from '@/types/domain'

export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) return null

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!profile) return null

  if (profile.role !== role) {
    return <Navigate to={profile.role === 'coach' ? '/coach/dashboard' : '/app/dashboard'} replace />
  }

  return <>{children}</>
}
