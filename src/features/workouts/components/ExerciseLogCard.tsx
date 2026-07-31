import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { NoteList } from '@/features/notes/components/NoteList'
import { useNotesForPlanDayExercise } from '@/features/notes/hooks'
import { TutorialVideoLink } from '@/features/exercises/components/TutorialVideoLink'
import { SetRow } from './SetRow'
import { usePreviousSets } from '../hooks'
import type { SetPatch, WorkoutExerciseWithDetails } from '../api'

function PlanNotesPreview({ planDayExerciseId }: { planDayExerciseId: string }) {
  const { data: notes } = useNotesForPlanDayExercise(planDayExerciseId)
  if (!notes?.length) return null
  return (
    <div className="space-y-2 border-t pt-2">
      <p className="text-muted-foreground text-xs font-medium">Coach notes</p>
      <NoteList notes={notes} />
    </div>
  )
}

function MyExerciseNote({
  initialNotes,
  onUpdate,
}: {
  initialNotes: string | null
  onUpdate: (notes: string) => void
}) {
  const [editing, setEditing] = useState(!!initialNotes)
  const [value, setValue] = useState(initialNotes ?? '')

  if (!editing) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-auto p-0"
        onClick={() => setEditing(true)}
      >
        <Plus className="mr-1 size-3.5" />
        Add note
      </Button>
    )
  }

  return (
    <div className="space-y-1 border-t pt-2">
      <p className="text-muted-foreground text-xs font-medium">Your notes</p>
      <Textarea
        placeholder="e.g. felt strong today, left shoulder tight on set 3..."
        className="min-h-14 text-sm"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => onUpdate(value)}
      />
    </div>
  )
}

export function ExerciseLogCard({
  workoutExercise,
  userId,
  sessionId,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onUpdateNotes,
}: {
  workoutExercise: WorkoutExerciseWithDetails
  userId: string
  sessionId: string
  onAddSet: () => void
  onUpdateSet: (setId: string, patch: SetPatch) => void
  onDeleteSet: (setId: string) => void
  onUpdateNotes: (notes: string) => void
}) {
  const { data: previousSets } = usePreviousSets(userId, workoutExercise.exercise_id, sessionId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{workoutExercise.exercises.name}</CardTitle>
        <TutorialVideoLink
          exerciseId={workoutExercise.exercises.id}
          exerciseName={workoutExercise.exercises.name}
          videoUrl={workoutExercise.exercises.video_url}
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {workoutExercise.sets.length > 0 && (
          <div className="text-muted-foreground flex gap-2 pl-7 text-xs">
            <span className="flex-1">Weight</span>
            <span className="flex-1">Reps</span>
            <span className="flex-1">RPE</span>
            <span className="w-9" />
            <span className="w-9" />
          </div>
        )}
        {workoutExercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            set={set}
            index={index}
            previous={previousSets?.[index]}
            onUpdate={(patch) => onUpdateSet(set.id, patch)}
            onDelete={() => onDeleteSet(set.id)}
          />
        ))}
        <Button type="button" variant="outline" size="sm" onClick={onAddSet}>
          <Plus className="mr-1 size-4" />
          Add set
        </Button>
        <MyExerciseNote initialNotes={workoutExercise.notes} onUpdate={onUpdateNotes} />
        {workoutExercise.plan_day_exercise_id && (
          <PlanNotesPreview planDayExerciseId={workoutExercise.plan_day_exercise_id} />
        )}
      </CardContent>
    </Card>
  )
}
