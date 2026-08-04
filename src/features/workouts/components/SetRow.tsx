import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PreviousSet, SetPatch, SetRow as SetRowData } from '../api'

function numberOrNull(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function SetRow({
  set,
  index,
  previous,
  onUpdate,
  onDelete,
}: {
  set: SetRowData
  index: number
  previous?: PreviousSet
  onUpdate: (patch: SetPatch) => void
  onDelete: () => void
}) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? '')
  const [reps, setReps] = useState(set.reps?.toString() ?? '')
  const [rpe, setRpe] = useState(set.rpe?.toString() ?? '')

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md p-1 transition-colors',
        set.completed && 'bg-green-100 dark:bg-green-950/40',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-9 w-9 shrink-0 rounded-md p-0 text-sm font-medium',
          set.is_warmup && 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-400',
        )}
        title={set.is_warmup ? 'Warm-up set (tap to mark as working set)' : 'Working set (tap to mark as warm-up)'}
        onClick={() => onUpdate({ is_warmup: !set.is_warmup })}
      >
        {set.is_warmup ? 'W' : index + 1}
      </Button>
      <Input
        type="number"
        inputMode="decimal"
        placeholder={previous?.weight != null ? String(previous.weight) : 'kg'}
        className="h-9 min-w-0 flex-[1.3] px-2"
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        onBlur={() => onUpdate({ weight: numberOrNull(weight) })}
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder={previous?.reps != null ? String(previous.reps) : 'reps'}
        className="h-9 min-w-0 flex-1 px-2"
        value={reps}
        onChange={(event) => setReps(event.target.value)}
        onBlur={() => onUpdate({ reps: numberOrNull(reps) })}
      />
      <Input
        type="number"
        inputMode="decimal"
        placeholder={previous?.rpe != null ? String(previous.rpe) : 'RPE'}
        min={0}
        max={10}
        step={0.5}
        className="h-9 min-w-0 flex-1 px-2"
        value={rpe}
        onChange={(event) => setRpe(event.target.value)}
        onBlur={() => onUpdate({ rpe: numberOrNull(rpe) })}
      />
      <Button
        type="button"
        size="icon"
        variant={set.completed ? 'default' : 'outline'}
        className={cn('size-9 shrink-0', set.completed && 'bg-green-600 hover:bg-green-700')}
        aria-label={set.completed ? 'Mark set incomplete' : 'Mark set complete'}
        onClick={() => onUpdate({ completed: !set.completed })}
      >
        <Check className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-9 shrink-0"
        aria-label="Delete set"
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
