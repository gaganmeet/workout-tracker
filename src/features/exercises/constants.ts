import type { EquipmentType, MuscleGroup } from '@/types/domain'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core',
  'forearms',
  'full_body',
  'cardio',
  'other',
]

export const EQUIPMENT_TYPES: EquipmentType[] = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'band',
  'other',
]

function toLabel(value: string) {
  return value
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

export function muscleGroupLabel(value: MuscleGroup | null) {
  return value ? toLabel(value) : 'Other'
}

export function equipmentLabel(value: EquipmentType | null) {
  return value ? toLabel(value) : 'Other'
}
