import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/AuthContext'
import { useOwnPlans } from '@/features/plans/hooks'
import { PlanCard } from '@/features/plans/components/PlanCard'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import { useExerciseProgress } from '@/features/progress/hooks'
import { OneRepMaxChart } from '@/features/progress/components/OneRepMaxChart'
import { VolumeChart } from '@/features/progress/components/VolumeChart'
import type { Exercise } from '@/types/domain'
import { useClientProfile, useClientSessions, usePlansAssignedToClient } from '../hooks'
import { AssignPlanDialog } from '../components/AssignPlanDialog'

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const { profile } = useAuth()
  const { data: client } = useClientProfile(clientId)
  const { data: sessions, isLoading: loadingSessions } = useClientSessions(clientId)
  const { data: ownPlans, isLoading: loadingOwnPlans } = useOwnPlans(clientId)
  const { data: assignedPlans, isLoading: loadingAssigned } = usePlansAssignedToClient(
    profile?.id,
    clientId,
  )
  const navigate = useNavigate()
  const [progressExercise, setProgressExercise] = useState<Exercise | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { data: progress, isLoading: loadingProgress } = useExerciseProgress(
    clientId,
    progressExercise?.id,
  )

  const completedCount = sessions?.filter((s) => s.completed_at).length ?? 0
  const completionRate = sessions?.length ? Math.round((completedCount / sessions.length) * 100) : null

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">{client?.display_name ?? client?.username ?? 'Client'}</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completion rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {completionRate === null ? '-' : `${completionRate}%`}
              </p>
              <p className="text-muted-foreground text-xs">
                {completedCount} of {sessions?.length ?? 0} recent workouts finished
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent workouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingSessions && <p className="text-muted-foreground text-sm">Loading...</p>}
              {sessions?.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex cursor-pointer items-center justify-between text-sm hover:underline"
                  onClick={() => navigate(`/coach/clients/${clientId}/sessions/${session.id}`)}
                >
                  <span>{session.name ?? 'Workout'}</span>
                  <span className="text-muted-foreground">
                    {format(new Date(session.started_at), 'PP')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Assigned by you</p>
            <div className="flex gap-2">
              {clientId && <AssignPlanDialog clientId={clientId} />}
              <Button size="sm" asChild>
                <Link to={`/coach/clients/${clientId}/plans/new`}>
                  <Plus className="mr-1 size-4" />
                  New
                </Link>
              </Button>
            </div>
          </div>
          {loadingAssigned && <p className="text-muted-foreground text-sm">Loading...</p>}
          {!loadingAssigned && assignedPlans?.length === 0 && (
            <p className="text-muted-foreground text-sm">No plans assigned yet.</p>
          )}
          {assignedPlans?.map((assignment) => (
            <PlanCard
              key={assignment.plan_id}
              plan={assignment.plans}
              onClick={() => navigate(`/coach/clients/${clientId}/plans/${assignment.plan_id}`)}
            />
          ))}

          <p className="pt-2 text-sm font-medium">Client's own plans</p>
          {loadingOwnPlans && <p className="text-muted-foreground text-sm">Loading...</p>}
          {!loadingOwnPlans && ownPlans?.length === 0 && (
            <p className="text-muted-foreground text-sm">No self-made plans.</p>
          )}
          {ownPlans?.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => navigate(`/coach/clients/${clientId}/plans/${plan.id}`)}
            />
          ))}
        </TabsContent>

        <TabsContent value="progress" className="space-y-3">
          <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
            {progressExercise ? progressExercise.name : 'Choose an exercise'}
          </Button>
          <ExercisePicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={setProgressExercise} />
          {progressExercise && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Strength</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingProgress ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  ) : (
                    <OneRepMaxChart data={progress ?? []} />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingProgress ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  ) : (
                    <VolumeChart data={progress ?? []} />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-2">
          {loadingSessions && <p className="text-muted-foreground text-sm">Loading...</p>}
          {sessions?.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => navigate(`/coach/clients/${clientId}/sessions/${session.id}`)}
            >
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{session.name ?? 'Workout'}</CardTitle>
                {!session.completed_at && <Badge variant="secondary">In progress</Badge>}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {format(new Date(session.started_at), 'PPP p')}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
