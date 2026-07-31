import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'
import { NoteList } from '@/features/notes/components/NoteList'
import { useNotesForExercise } from '@/features/notes/hooks'
import { useExerciseProgress } from '@/features/progress/hooks'
import { OneRepMaxChart } from '@/features/progress/components/OneRepMaxChart'
import { VolumeChart } from '@/features/progress/components/VolumeChart'
import { useExercise } from '../hooks'
import { equipmentLabel, muscleGroupLabel } from '../constants'

export function ExerciseDetailPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const { profile } = useAuth()
  const { data: exercise, isLoading } = useExercise(exerciseId)
  const { data: notes } = useNotesForExercise(exerciseId, profile?.id)
  const { data: progress, isLoading: loadingProgress } = useExerciseProgress(profile?.id, exerciseId)

  if (isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading...</p>
  }

  if (!exercise) {
    return <p className="text-muted-foreground p-4 text-sm">Exercise not found.</p>
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold">{exercise.name}</h1>
        <div className="mt-1 flex gap-2">
          <Badge variant="secondary">{muscleGroupLabel(exercise.muscle_group)}</Badge>
          <Badge variant="secondary">{equipmentLabel(exercise.equipment)}</Badge>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Strength</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProgress ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <OneRepMaxChart data={progress ?? []} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Volume</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProgress ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <VolumeChart data={progress ?? []} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Coach notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteList notes={notes ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
