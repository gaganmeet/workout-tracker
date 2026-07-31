import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import type { DraftDay, DraftExercise } from '../types'
import type { Exercise } from '@/types/domain'

function numberOrNull(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function PlanDayEditor({
  day,
  onChange,
  onRemove,
}: {
  day: DraftDay
  onChange: (day: DraftDay) => void
  onRemove: () => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  function updateExercise(tempId: string, patch: Partial<DraftExercise>) {
    onChange({
      ...day,
      exercises: day.exercises.map((exercise) =>
        exercise.tempId === tempId ? { ...exercise, ...patch } : exercise,
      ),
    })
  }

  function removeExercise(tempId: string) {
    onChange({ ...day, exercises: day.exercises.filter((exercise) => exercise.tempId !== tempId) })
  }

  function addExercise(exercise: Exercise) {
    const draft: DraftExercise = {
      tempId: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      targetSets: 3,
      targetRepsMin: null,
      targetRepsMax: null,
      targetRpe: null,
      notes: '',
    }
    onChange({ ...day, exercises: [...day.exercises, draft] })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Input
          value={day.name}
          onChange={(event) => onChange({ ...day, name: event.target.value })}
          placeholder="Day name (e.g. Push Day)"
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {day.exercises.map((exercise) => (
          <div key={exercise.tempId} className="border-border space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">{exercise.exerciseName}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExercise(exercise.tempId)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-muted-foreground text-xs">Sets</label>
                <Input
                  type="number"
                  min={0}
                  value={exercise.targetSets ?? ''}
                  onChange={(event) =>
                    updateExercise(exercise.tempId, { targetSets: numberOrNull(event.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs">Reps min</label>
                <Input
                  type="number"
                  min={0}
                  value={exercise.targetRepsMin ?? ''}
                  onChange={(event) =>
                    updateExercise(exercise.tempId, {
                      targetRepsMin: numberOrNull(event.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs">Reps max</label>
                <Input
                  type="number"
                  min={0}
                  value={exercise.targetRepsMax ?? ''}
                  onChange={(event) =>
                    updateExercise(exercise.tempId, {
                      targetRepsMax: numberOrNull(event.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs">RPE</label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={exercise.targetRpe ?? ''}
                  onChange={(event) =>
                    updateExercise(exercise.tempId, { targetRpe: numberOrNull(event.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <Plus className="mr-1 size-4" />
          Add exercise
        </Button>
        <ExercisePicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={addExercise} />
      </CardContent>
    </Card>
  )
}
