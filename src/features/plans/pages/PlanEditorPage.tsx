import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePlanDetail, useSavePlan } from '../hooks'
import { PlanDayEditor } from '../components/PlanDayEditor'
import { draftToPayload, type DraftDay, type DraftPlan } from '../types'

function emptyDay(): DraftDay {
  return { tempId: crypto.randomUUID(), name: '', exercises: [] }
}

export function PlanEditorPage({ assignClientId }: { assignClientId?: string } = {}) {
  const { planId } = useParams<{ planId: string }>()
  const isEditing = !!planId
  const { data: existingPlan, isLoading } = usePlanDetail(planId)
  const savePlan = useSavePlan()
  const navigate = useNavigate()

  const [draft, setDraft] = useState<DraftPlan>({ name: '', description: '', days: [emptyDay()] })

  useEffect(() => {
    if (existingPlan) {
      setDraft({
        id: existingPlan.id,
        name: existingPlan.name,
        description: existingPlan.description ?? '',
        days: existingPlan.plan_days.map((day) => ({
          tempId: day.id,
          name: day.name,
          exercises: day.plan_day_exercises.map((exercise) => ({
            tempId: exercise.id,
            exerciseId: exercise.exercise_id,
            exerciseName: exercise.exercises.name,
            targetSets: exercise.target_sets,
            targetRepsMin: exercise.target_reps_min,
            targetRepsMax: exercise.target_reps_max,
            targetRpe: exercise.target_rpe,
            notes: exercise.notes ?? '',
          })),
        })),
      })
    }
  }, [existingPlan])

  function updateDay(tempId: string, next: DraftDay) {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day) => (day.tempId === tempId ? next : day)),
    }))
  }

  function removeDay(tempId: string) {
    setDraft((prev) => ({ ...prev, days: prev.days.filter((day) => day.tempId !== tempId) }))
  }

  function addDay() {
    setDraft((prev) => ({ ...prev, days: [...prev.days, emptyDay()] }))
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      toast.error('Give your plan a name')
      return
    }
    try {
      const savedId = await savePlan.mutateAsync(draftToPayload(draft, assignClientId))
      toast.success('Plan saved')
      navigate(assignClientId ? `/coach/clients/${assignClientId}` : `/app/plans/${savedId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save plan')
    }
  }

  if (isEditing && isLoading) {
    return <p className="text-muted-foreground p-4 text-sm">Loading...</p>
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">{isEditing ? 'Edit plan' : 'New plan'}</h1>
      <div className="space-y-3">
        <div>
          <Label htmlFor="plan-name">Plan name</Label>
          <Input
            id="plan-name"
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="e.g. Hypertrophy Block"
          />
        </div>
        <div>
          <Label htmlFor="plan-description">Description</Label>
          <Input
            id="plan-description"
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-3">
        {draft.days.map((day) => (
          <PlanDayEditor
            key={day.tempId}
            day={day}
            onChange={(next) => updateDay(day.tempId, next)}
            onRemove={() => removeDay(day.tempId)}
          />
        ))}
        <Button type="button" variant="outline" onClick={addDay}>
          <Plus className="mr-1 size-4" />
          Add day
        </Button>
      </div>

      <Button className="w-full" onClick={() => void handleSave()} disabled={savePlan.isPending}>
        {savePlan.isPending ? 'Saving...' : 'Save plan'}
      </Button>
    </div>
  )
}
