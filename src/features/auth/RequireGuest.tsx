import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireGuest({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) return null
  if (session && !profile) return null

  if (session) {
    return <Navigate to={profile?.role === 'coach' ? '/coach/dashboard' : '/app/dashboard'} replace />
  }

  return <>{children}</>
}
