import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import { ExerciseLogCard } from '../components/ExerciseLogCard'
import {
  useAddSet,
  useAddWorkoutExercise,
  useDeleteSession,
  useDeleteSet,
  useFinishSession,
  useSessionDetail,
  useUpdateSet,
  useUpdateWorkoutExerciseNotes,
} from '../hooks'
import type { Exercise } from '@/types/domain'

export function ActiveWorkoutPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { data: session, isLoading } = useSessionDetail(sessionId)
  const addWorkoutExercise = useAddWorkoutExercise(sessionId!)
  const addSet = useAddSet(sessionId!)
  const updateSet = useUpdateSet(sessionId!)
  const deleteSet = useDeleteSet(sessionId!)
  const updateNotes = useUpdateWorkoutExerciseNotes(sessionId!)
  const finishSession = useFinishSession(sessionId!)
  const deleteSession = useDeleteSession()
  const [pickerOpen, setPickerOpen] = useState(false)

  if (isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading...</p>
  }

  if (!session) {
    return <p className="text-muted-foreground p-4 text-sm">Workout not found.</p>
  }

  function handleAddExercise(exercise: Exercise) {
    addWorkoutExercise.mutate({
      exerciseId: exercise.id,
      order: session!.workout_exercises.length,
    })
  }

  async function handleFinish() {
    try {
      await finishSession.mutateAsync()
      toast.success('Workout complete')
      navigate(`/app/history/${sessionId}`, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to finish workout')
    }
  }

  async function handleDiscard() {
    if (!confirm('End this workout without saving it? Everything logged so far will be deleted.')) {
      return
    }
    try {
      await deleteSession.mutateAsync(sessionId!)
      toast.success('Workout discarded')
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to discard workout')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{session.name ?? 'Workout'}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void handleDiscard()}
            disabled={deleteSession.isPending}
          >
            Discard
          </Button>
          <Button onClick={() => void handleFinish()} disabled={finishSession.isPending}>
            {finishSession.isPending ? 'Finishing...' : 'Finish'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {session.workout_exercises.map((workoutExercise) => (
          <ExerciseLogCard
            key={workoutExercise.id}
            workoutExercise={workoutExercise}
            userId={session.user_id}
            sessionId={sessionId!}
            onAddSet={() =>
              addSet.mutate({
                workoutExerciseId: workoutExercise.id,
                setOrder: workoutExercise.sets.length,
              })
            }
            onUpdateSet={(setId, patch) => updateSet.mutate({ setId, patch })}
            onDeleteSet={(setId) => deleteSet.mutate(setId)}
            onUpdateNotes={(notes) =>
              updateNotes.mutate({ workoutExerciseId: workoutExercise.id, notes })
            }
          />
        ))}
      </div>

      <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
        <Plus className="mr-1 size-4" />
        Add exercise
      </Button>
      <ExercisePicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={handleAddExercise} />
    </div>
  )
}
