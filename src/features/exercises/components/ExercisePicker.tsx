import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useExercises } from '../hooks'
import { equipmentLabel, muscleGroupLabel } from '../constants'
import { CreateExerciseForm } from './CreateExerciseForm'
import type { Exercise } from '@/types/domain'

export function ExercisePicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (exercise: Exercise) => void
}) {
  const { data: exercises, isLoading } = useExercises()
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    if (!exercises) return []
    const query = search.trim().toLowerCase()
    if (!query) return exercises
    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(query))
  }, [exercises, search])

  function reset() {
    setSearch('')
    setCreating(false)
  }

  function pick(exercise: Exercise) {
    onSelect(exercise)
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent className="max-h-[80vh] gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{creating ? 'Add custom exercise' : 'Choose an exercise'}</DialogTitle>
          {!creating && (
            <div className="relative mt-2">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                autoFocus
                placeholder="Search exercises..."
                className="pl-8"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          )}
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {creating ? (
            <CreateExerciseForm
              initialName={search}
              onCreated={pick}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <div className="-m-2 space-y-1">
              {isLoading && <p className="text-muted-foreground p-2 text-sm">Loading...</p>}
              {!isLoading && filtered.length === 0 && (
                <p className="text-muted-foreground p-2 text-sm">No exercises found.</p>
              )}
              {filtered.map((exercise) => (
                <Button
                  key={exercise.id}
                  variant="ghost"
                  className="h-auto w-full justify-start px-3 py-2"
                  onClick={() => pick(exercise)}
                >
                  <div className="text-left">
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {muscleGroupLabel(exercise.muscle_group)} · {equipmentLabel(exercise.equipment)}
                    </p>
                  </div>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="text-muted-foreground h-auto w-full justify-start px-3 py-2"
                onClick={() => setCreating(true)}
              >
                <Plus className="mr-2 size-4" />
                {search.trim() ? `Add "${search.trim()}" as a new exercise` : 'Add a custom exercise'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
