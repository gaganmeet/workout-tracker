import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExerciseProgress } from '@/features/progress/hooks'
import { OneRepMaxChart } from '@/features/progress/components/OneRepMaxChart'
import { VolumeChart } from '@/features/progress/components/VolumeChart'

export function ExerciseProgressSection({
  userId,
  exerciseId,
}: {
  userId: string
  exerciseId: string
}) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useExerciseProgress(open ? userId : undefined, exerciseId)

  return (
    <div className="border-t pt-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-auto p-0"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <ChevronUp className="mr-1 size-3.5" /> : <ChevronDown className="mr-1 size-3.5" />}
        {open ? 'Hide progress' : 'Show progress'}
      </Button>
      {open && (
        <div className="mt-3 space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <>
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Strength</p>
                <OneRepMaxChart data={data ?? []} />
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Volume</p>
                <VolumeChart data={data ?? []} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
