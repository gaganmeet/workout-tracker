import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/AuthContext'
import { GymSelect } from '@/features/gyms/components/GymSelect'
import { useCreateAdHocSession, useCreateSessionFromPlanDay } from '../hooks'

export function StartWorkoutPage() {
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const planDayId = searchParams.get('planDayId')
  const navigate = useNavigate()
  const createFromPlanDay = useCreateSessionFromPlanDay()
  const createAdHoc = useCreateAdHocSession()
  const [gymId, setGymId] = useState<string | null>(null)

  const starting = createFromPlanDay.isPending || createAdHoc.isPending

  async function handleStart() {
    if (!profile) return
    try {
      const sessionId = planDayId
        ? await createFromPlanDay.mutateAsync({ userId: profile.id, planDayId, gymId })
        : await createAdHoc.mutateAsync({ userId: profile.id, gymId })
      navigate(`/app/workout/active/${sessionId}`, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start workout')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Start a workout</h1>
      <Card>
        <CardHeader>
          <CardTitle>{planDayId ? 'Ready to train' : 'Ad-hoc workout'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!planDayId && (
            <p className="text-muted-foreground text-sm">
              Start with a blank workout and add exercises as you go.
            </p>
          )}
          <div>
            <Label>Gym (optional)</Label>
            <p className="text-muted-foreground mb-1 text-xs">
              Tagging a gym helps last-time placeholders reflect the machines/plates there.
            </p>
            <GymSelect ownerId={profile!.id} value={gymId} onChange={setGymId} />
          </div>
          <Button onClick={() => void handleStart()} disabled={starting}>
            {starting ? 'Starting...' : planDayId ? 'Start workout' : 'Start ad-hoc workout'}
          </Button>
        </CardContent>
      </Card>
      {!planDayId && (
        <p className="text-muted-foreground text-sm">
          To start from a plan, open a plan and tap "Start" on a day.
        </p>
      )}
    </div>
  )
}
