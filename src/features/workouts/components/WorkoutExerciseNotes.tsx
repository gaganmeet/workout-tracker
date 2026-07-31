import { NoteList } from '@/features/notes/components/NoteList'
import { NoteEditor } from '@/features/notes/components/NoteEditor'
import { useNotesForWorkoutExercise } from '@/features/notes/hooks'

export function WorkoutExerciseNotes({
  workoutExerciseId,
  exerciseId,
  clientId,
  coachId,
}: {
  workoutExerciseId: string
  exerciseId: string
  clientId: string
  coachId?: string
}) {
  const { data: notes } = useNotesForWorkoutExercise(workoutExerciseId)

  return (
    <div className="space-y-2 border-t pt-2">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs font-medium">Coach notes</p>
        {coachId && (
          <NoteEditor
            coachId={coachId}
            clientId={clientId}
            exerciseId={exerciseId}
            workoutExerciseId={workoutExerciseId}
          />
        )}
      </div>
      <NoteList notes={notes ?? []} />
    </div>
  )
}
