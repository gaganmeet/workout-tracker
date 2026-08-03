import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { GymSelect } from '@/features/gyms/components/GymSelect'
import { WorkoutExerciseNotes } from '../components/WorkoutExerciseNotes'
import { ExerciseProgressSection } from '../components/ExerciseProgressSection'
import { useDeleteSession, useSessionDetail, useUpdateSessionGym } from '../hooks'

export function WorkoutDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data: session, isLoading } = useSessionDetail(sessionId)
  const { profile } = useAuth()
  const navigate = useNavigate()
  const deleteSession = useDeleteSession()
  const updateGym = useUpdateSessionGym(sessionId!)

  if (isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading...</p>
  }

  if (!session) {
    return <p className="text-muted-foreground p-4 text-sm">Workout not found.</p>
  }

  const isOwnSession = session.user_id === profile?.id
  const isCoachView = profile?.role === 'coach' && !isOwnSession

  async function handleDelete() {
    if (!confirm('Delete this workout? This cannot be undone.')) return
    try {
      await deleteSession.mutateAsync(session!.id)
      toast.success('Workout deleted')
      navigate('/app/history', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete workout')
    }
  }

  async function handleUpdateGym(gymId: string | null) {
    try {
      await updateGym.mutateAsync(gymId)
      toast.success('Gym updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update gym')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{session.name ?? 'Workout'}</h1>
          <p className="text-muted-foreground text-sm">
            {format(new Date(session.started_at), 'PPP p')}
          </p>
          {!isOwnSession && session.gyms && <Badge variant="outline">{session.gyms.name}</Badge>}
        </div>
        {isOwnSession && (
          <div className="flex gap-2">
            {!session.completed_at && (
              <Button size="sm" onClick={() => navigate(`/app/workout/active/${session.id}`)}>
                Continue
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleteSession.isPending}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {isOwnSession && (
        <div className="max-w-xs">
          <p className="text-muted-foreground mb-1 text-xs font-medium">Gym</p>
          <GymSelect
            ownerId={session.user_id}
            value={session.gym_id}
            onChange={(gymId) => void handleUpdateGym(gymId)}
          />
        </div>
      )}

      <div className="space-y-3">
        {session.workout_exercises.map((workoutExercise) => (
          <Card key={workoutExercise.id}>
            <CardHeader>
              <CardTitle className="text-base">{workoutExercise.exercises.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                {workoutExercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-5">{set.is_warmup ? 'W' : index + 1}</span>
                    <span className="flex-1">{set.weight ?? '-'} kg</span>
                    <span className="flex-1">{set.reps ?? '-'} reps</span>
                    <span className="flex-1">{set.rpe ? `RPE ${set.rpe}` : '-'}</span>
                    {set.is_warmup && <Badge variant="outline">Warm-up</Badge>}
                    {set.completed && <Badge variant="secondary">Done</Badge>}
                  </div>
                ))}
              </div>
              {workoutExercise.notes && (
                <div className="space-y-1 border-t pt-2">
                  <p className="text-muted-foreground text-xs font-medium">
                    {isCoachView ? "Client's notes" : 'Your notes'}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{workoutExercise.notes}</p>
                </div>
              )}
              <WorkoutExerciseNotes
                workoutExerciseId={workoutExercise.id}
                exerciseId={workoutExercise.exercise_id}
                clientId={session.user_id}
                coachId={isCoachView ? profile?.id : undefined}
              />
              <ExerciseProgressSection
                userId={session.user_id}
                exerciseId={workoutExercise.exercise_id}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
