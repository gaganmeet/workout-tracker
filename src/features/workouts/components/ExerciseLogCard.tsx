import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NoteList } from '@/features/notes/components/NoteList'
import { useNotesForPlanDayExercise } from '@/features/notes/hooks'
import { SetRow } from './SetRow'
import type { WorkoutExerciseWithDetails } from '../api'

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

export function ExerciseLogCard({
  workoutExercise,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}: {
  workoutExercise: WorkoutExerciseWithDetails
  onAddSet: () => void
  onUpdateSet: (
    setId: string,
    patch: { weight?: number | null; reps?: number | null; rpe?: number | null; completed?: boolean },
  ) => void
  onDeleteSet: (setId: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{workoutExercise.exercises.name}</CardTitle>
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
            onUpdate={(patch) => onUpdateSet(set.id, patch)}
            onDelete={() => onDeleteSet(set.id)}
          />
        ))}
        <Button type="button" variant="outline" size="sm" onClick={onAddSet}>
          <Plus className="mr-1 size-4" />
          Add set
        </Button>
        {workoutExercise.plan_day_exercise_id && (
          <PlanNotesPreview planDayExerciseId={workoutExercise.plan_day_exercise_id} />
        )}
      </CardContent>
    </Card>
  )
}
