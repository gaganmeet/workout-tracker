import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useExercises } from '../hooks'
import { ExerciseCard } from '../components/ExerciseCard'
import { CreateExerciseDialog } from '../components/CreateExerciseDialog'

export function ExerciseLibraryPage() {
  const { data: exercises, isLoading } = useExercises()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    if (!exercises) return []
    const query = search.trim().toLowerCase()
    if (!query) return exercises
    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(query))
  }, [exercises, search])

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Exercises</h1>
        <CreateExerciseDialog />
      </div>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search exercises..."
          className="pl-8"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="text-muted-foreground text-sm">No exercises found.</p>
        )}
        {filtered.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onClick={() => navigate(`/app/exercises/${exercise.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
