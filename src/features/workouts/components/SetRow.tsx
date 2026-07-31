import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SetRow as SetRowData } from '../api'

function numberOrNull(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function SetRow({
  set,
  index,
  onUpdate,
  onDelete,
}: {
  set: SetRowData
  index: number
  onUpdate: (patch: { weight?: number | null; reps?: number | null; rpe?: number | null; completed?: boolean }) => void
  onDelete: () => void
}) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? '')
  const [reps, setReps] = useState(set.reps?.toString() ?? '')
  const [rpe, setRpe] = useState(set.rpe?.toString() ?? '')

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-5 text-center text-sm">{index + 1}</span>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="kg"
        className="h-9"
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        onBlur={() => onUpdate({ weight: numberOrNull(weight) })}
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder="reps"
        className="h-9"
        value={reps}
        onChange={(event) => setReps(event.target.value)}
        onBlur={() => onUpdate({ reps: numberOrNull(reps) })}
      />
      <Input
        type="number"
        inputMode="decimal"
        placeholder="RPE"
        min={0}
        max={10}
        step={0.5}
        className="h-9"
        value={rpe}
        onChange={(event) => setRpe(event.target.value)}
        onBlur={() => onUpdate({ rpe: numberOrNull(rpe) })}
      />
      <Button
        type="button"
        size="icon"
        variant={set.completed ? 'default' : 'outline'}
        className={cn('size-9 shrink-0', set.completed && 'bg-green-600 hover:bg-green-700')}
        onClick={() => onUpdate({ completed: !set.completed })}
      >
        <Check className="size-4" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="size-9 shrink-0" onClick={onDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
