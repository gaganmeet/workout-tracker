import { useState } from 'react'
import { Trash2, Plus, GripVertical } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import { TutorialVideoLinkById } from '@/features/exercises/components/TutorialVideoLinkById'
import type { DraftDay, DraftExercise } from '../types'
import type { Exercise } from '@/types/domain'

function numberOrNull(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function SortableExerciseRow({
  exercise,
  onUpdate,
  onRemove,
}: {
  exercise: DraftExercise
  onUpdate: (patch: Partial<DraftExercise>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.tempId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="border-border space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="text-muted-foreground shrink-0 touch-none active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
          <p className="truncate font-medium">{exercise.exerciseName}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
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
            onChange={(event) => onUpdate({ targetSets: numberOrNull(event.target.value) })}
          />
        </div>
        <div>
          <label className="text-muted-foreground text-xs">Reps min</label>
          <Input
            type="number"
            min={0}
            value={exercise.targetRepsMin ?? ''}
            onChange={(event) => onUpdate({ targetRepsMin: numberOrNull(event.target.value) })}
          />
        </div>
        <div>
          <label className="text-muted-foreground text-xs">Reps max</label>
          <Input
            type="number"
            min={0}
            value={exercise.targetRepsMax ?? ''}
            onChange={(event) => onUpdate({ targetRepsMax: numberOrNull(event.target.value) })}
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
            onChange={(event) => onUpdate({ targetRpe: numberOrNull(event.target.value) })}
          />
        </div>
      </div>
      <TutorialVideoLinkById exerciseId={exercise.exerciseId} exerciseName={exercise.exerciseName} />
    </div>
  )
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = day.exercises.findIndex((exercise) => exercise.tempId === active.id)
    const newIndex = day.exercises.findIndex((exercise) => exercise.tempId === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onChange({ ...day, exercises: arrayMove(day.exercises, oldIndex, newIndex) })
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={day.exercises.map((exercise) => exercise.tempId)}
            strategy={verticalListSortingStrategy}
          >
            {day.exercises.map((exercise) => (
              <SortableExerciseRow
                key={exercise.tempId}
                exercise={exercise}
                onUpdate={(patch) => updateExercise(exercise.tempId, patch)}
                onRemove={() => removeExercise(exercise.tempId)}
              />
            ))}
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <Plus className="mr-1 size-4" />
          Add exercise
        </Button>
        <ExercisePicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={addExercise} />
      </CardContent>
    </Card>
  )
}
