import type { Database } from '@/lib/supabase/database.types'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type UserRole = Database['public']['Enums']['user_role']
export type MuscleGroup = Database['public']['Enums']['muscle_group']
export type EquipmentType = Database['public']['Enums']['equipment_type']

export type CoachClientLink = Tables['coach_client_links']['Row']
export type Exercise = Tables['exercises']['Row']
export type Plan = Tables['plans']['Row']
export type PlanDay = Tables['plan_days']['Row']
export type PlanDayExercise = Tables['plan_day_exercises']['Row']
export type PlanAssignment = Tables['plan_assignments']['Row']
export type WorkoutSession = Tables['workout_sessions']['Row']
export type WorkoutExercise = Tables['workout_exercises']['Row']
export type WorkoutSet = Tables['sets']['Row']
export type ExerciseNote = Tables['exercise_notes']['Row']
