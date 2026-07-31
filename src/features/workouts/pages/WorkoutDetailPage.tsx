import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { WorkoutExerciseNotes } from '../components/WorkoutExerciseNotes'
import { useSessionDetail } from '../hooks'

export function WorkoutDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data: session, isLoading } = useSessionDetail(sessionId)
  const { profile } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading...</p>
  }

  if (!session) {
    return <p className="text-muted-foreground p-4 text-sm">Workout not found.</p>
  }

  const isOwnSession = session.user_id === profile?.id
  const isCoachView = profile?.role === 'coach' && !isOwnSession

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{session.name ?? 'Workout'}</h1>
          <p className="text-muted-foreground text-sm">
            {format(new Date(session.started_at), 'PPP p')}
          </p>
        </div>
        {isOwnSession && !session.completed_at && (
          <Button size="sm" onClick={() => navigate(`/app/workout/active/${session.id}`)}>
            Continue
          </Button>
        )}
      </div>

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
                    <span className="text-muted-foreground w-5">{index + 1}</span>
                    <span className="flex-1">{set.weight ?? '-'} kg</span>
                    <span className="flex-1">{set.reps ?? '-'} reps</span>
                    <span className="flex-1">{set.rpe ? `RPE ${set.rpe}` : '-'}</span>
                    {set.completed && <Badge variant="secondary">Done</Badge>}
                  </div>
                ))}
              </div>
              <WorkoutExerciseNotes
                workoutExerciseId={workoutExercise.id}
                exerciseId={workoutExercise.exercise_id}
                clientId={session.user_id}
                coachId={isCoachView ? profile?.id : undefined}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
