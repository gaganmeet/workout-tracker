import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/features/auth/AuthContext'
import { useCreateExercise } from '../hooks'
import { EQUIPMENT_TYPES, MUSCLE_GROUPS, equipmentLabel, muscleGroupLabel } from '../constants'
import type { Exercise, EquipmentType, MuscleGroup } from '@/types/domain'

const schema = z.object({
  name: z.string().min(1, 'Required').max(80),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CreateExerciseForm({
  initialName = '',
  onCreated,
  onCancel,
}: {
  initialName?: string
  onCreated: (exercise: Exercise) => void
  onCancel?: () => void
}) {
  const { profile } = useAuth()
  const createExercise = useCreateExercise()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName, muscleGroup: undefined, equipment: undefined },
  })

  async function onSubmit(values: FormValues) {
    if (!profile) return
    try {
      const exercise = await createExercise.mutateAsync({
        name: values.name,
        muscleGroup: (values.muscleGroup as MuscleGroup | undefined) || null,
        equipment: (values.equipment as EquipmentType | undefined) || null,
        createdBy: profile.id,
      })
      toast.success('Exercise added')
      onCreated(exercise)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add exercise')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Landmine Press" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="muscleGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Muscle group</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {muscleGroupLabel(group)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {equipmentLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={createExercise.isPending}>
            {createExercise.isPending ? 'Adding...' : 'Add exercise'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
