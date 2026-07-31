import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import { useAuth } from '@/features/auth/AuthContext'
import { useExerciseProgress } from '../hooks'
import { OneRepMaxChart } from '../components/OneRepMaxChart'
import { VolumeChart } from '../components/VolumeChart'
import type { Exercise } from '@/types/domain'

export function ProgressPage() {
  const { profile } = useAuth()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { data, isLoading } = useExerciseProgress(profile?.id, exercise?.id)

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Progress</h1>
      <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
        {exercise ? exercise.name : 'Choose an exercise'}
      </Button>
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
