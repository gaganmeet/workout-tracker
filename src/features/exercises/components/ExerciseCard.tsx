import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { equipmentLabel, muscleGroupLabel } from '../constants'
import type { Exercise } from '@/types/domain'

export function ExerciseCard({ exercise, onClick }: { exercise: Exercise; onClick?: () => void }) {
  return (
    <Card
      className={onClick ? 'cursor-pointer transition-colors hover:bg-accent' : undefined}
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between gap-2 px-4 py-3">
        <div>
          <p className="font-medium">{exercise.name}</p>
          <p className="text-muted-foreground text-xs">
            {muscleGroupLabel(exercise.muscle_group)} · {equipmentLabel(exercise.equipment)}
          </p>
        </div>
        {exercise.created_by && <Badge variant="secondary">Custom</Badge>}
      </CardContent>
    </Card>
  )
}
