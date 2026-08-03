import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import { useAuth } from '@/features/auth/AuthContext'
import { useGyms } from '@/features/gyms/hooks'
import { useExerciseProgress } from '../hooks'
import { OneRepMaxChart } from '../components/OneRepMaxChart'
import { VolumeChart } from '../components/VolumeChart'
import type { Exercise } from '@/types/domain'

export function ProgressPage() {
  const { profile } = useAuth()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [gymFilter, setGymFilter] = useState('all')
  const { data: gyms } = useGyms(profile?.id)
  const { data, isLoading } = useExerciseProgress(profile?.id, exercise?.id, gymFilter)

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Progress</h1>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
          {exercise ? exercise.name : 'Choose an exercise'}
        </Button>
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
      </div>
      <ExercisePicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={setExercise} />

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
