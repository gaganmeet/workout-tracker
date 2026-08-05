import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import { useAuth } from '@/features/auth/AuthContext'
import { useGyms } from '@/features/gyms/hooks'
import { cn } from '@/lib/utils'
import { useExerciseProgress, useRecentExercises } from '../hooks'
import { OneRepMaxChart } from '../components/OneRepMaxChart'
import { VolumeChart } from '../components/VolumeChart'

type SelectedExercise = { id: string; name: string }

export function ProgressPage() {
  const { profile } = useAuth()
  const [exercise, setExercise] = useState<SelectedExercise | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [gymFilter, setGymFilter] = useState('all')
  const { data: gyms } = useGyms(profile?.id)
  const { data: recentExercises, isLoading: loadingRecent } = useRecentExercises(profile?.id)
  const { data, isLoading } = useExerciseProgress(profile?.id, exercise?.id, gymFilter)

  // Default to the most recently trained exercise once it loads, without
  // clobbering a choice the user already made.
  useEffect(() => {
    if (!exercise && recentExercises?.length) setExercise(recentExercises[0])
  }, [exercise, recentExercises])

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Progress</h1>

      <div className="space-y-2">
        {!!recentExercises?.length && <p className="text-muted-foreground text-xs font-medium">Recently trained</p>}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {recentExercises?.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setExercise(ex)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                exercise?.id === ex.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {ex.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <Search className="size-3.5" />
            {recentExercises?.length ? 'More' : 'Choose an exercise'}
          </button>
        </div>
      </div>

      {!!gyms?.length && (
        <Select value={gymFilter} onValueChange={setGymFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All gyms</SelectItem>
            <SelectItem value="none">No gym</SelectItem>
            {gyms.map((gym) => (
              <SelectItem key={gym.id} value={gym.id}>
                {gym.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <ExercisePicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={setExercise} />

      {!exercise && !loadingRecent && !recentExercises?.length && (
        <p className="text-muted-foreground text-sm">Log a workout to start seeing your progress here.</p>
      )}

      {exercise && (
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strength</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : (
                <OneRepMaxChart data={data ?? []} />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : (
                <VolumeChart data={data ?? []} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
