import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'
import { useCreateAdHocSession, useCreateSessionFromPlanDay } from '../hooks'

export function StartWorkoutPage() {
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const planDayId = searchParams.get('planDayId')
  const navigate = useNavigate()
  const createFromPlanDay = useCreateSessionFromPlanDay()
  const createAdHoc = useCreateAdHocSession()
  const [starting, setStarting] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!planDayId || !profile || startedRef.current) return
    startedRef.current = true
    setStarting(true)
    createFromPlanDay.mutate(
      { userId: profile.id, planDayId },
      {
        onSuccess: (sessionId) => navigate(`/app/workout/active/${sessionId}`, { replace: true }),
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to start workout')
          setStarting(false)
        },
      },
    )
  }, [planDayId, profile, createFromPlanDay, navigate])

  async function startAdHoc() {
    if (!profile) return
    setStarting(true)
    try {
      const sessionId = await createAdHoc.mutateAsync(profile.id)
      navigate(`/app/workout/active/${sessionId}`, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start workout')
      setStarting(false)
    }
  }

  if (planDayId) {
    return <p className="text-muted-foreground p-4 text-sm">Starting workout...</p>
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Start a workout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ad-hoc workout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Start with a blank workout and add exercises as you go.
          </p>
          <Button onClick={() => void startAdHoc()} disabled={starting}>
            {starting ? 'Starting...' : 'Start ad-hoc workout'}
          </Button>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">
        To start from a plan, open a plan from the Plans tab and tap "Start" on a day.
      </p>
    </div>
  )
}
