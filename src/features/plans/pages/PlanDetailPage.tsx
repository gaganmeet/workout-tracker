import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/AuthContext'
import { usePlanDetail, useDeletePlan } from '../hooks'
import { PlanExerciseNotes } from '../components/PlanExerciseNotes'

export function PlanDetailPage({ basePath = '/app/plans' }: { basePath?: string } = {}) {
  const { planId, clientId } = useParams<{ planId: string; clientId?: string }>()
  const { profile } = useAuth()
  const { data: plan, isLoading } = usePlanDetail(planId)
  const deletePlan = useDeletePlan()
  const navigate = useNavigate()

  if (isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading...</p>
  }

  if (!plan) {
    return <p className="text-muted-foreground p-4 text-sm">Plan not found.</p>
  }

  const isOwner = plan.owner_id === profile?.id
  const isAthlete = profile?.role === 'athlete'
  const isCoach = profile?.role === 'coach'
  // Notes need a concrete client to attach to: for a coach that's whichever
  // client's route this plan is being viewed under; for an athlete it's
  // always themselves (their own plan or one assigned to them).
  const notesClientId = isCoach ? clientId : profile?.id

  async function handleDelete() {
    if (!confirm('Delete this plan? This cannot be undone.')) return
    try {
      await deletePlan.mutateAsync(plan!.id)
      toast.success('Plan deleted')
      navigate(basePath)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete plan')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{plan.name}</h1>
          {plan.description && <p className="text-muted-foreground text-sm">{plan.description}</p>}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`${basePath}/${plan.id}/edit`}>Edit</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => void handleDelete()}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {plan.plan_days.map((day) => (
          <Card key={day.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{day.name}</CardTitle>
              {isAthlete && (
                <Button size="sm" asChild>
                  <Link to={`/app/workout/start?planDayId=${day.id}`}>Start</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {day.plan_day_exercises.length === 0 && (
                <p className="text-muted-foreground text-sm">No exercises yet.</p>
              )}
              {day.plan_day_exercises.map((exercise) => (
                <div key={exercise.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{exercise.exercises.name}</span>
                    <Badge variant="secondary">
                      {exercise.target_sets ?? '-'} x {exercise.target_reps_min ?? '-'}
                      {exercise.target_reps_max ? `-${exercise.target_reps_max}` : ''}
                      {exercise.target_rpe ? ` @ RPE ${exercise.target_rpe}` : ''}
                    </Badge>
                  </div>
                  {notesClientId && (
                    <PlanExerciseNotes
                      planDayExerciseId={exercise.id}
                      exerciseId={exercise.exercise_id}
                      clientId={notesClientId}
                      coachId={isCoach ? profile?.id : undefined}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
