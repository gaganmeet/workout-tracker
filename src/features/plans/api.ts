import { supabase } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/database.types'
import type { Exercise, Plan, PlanDay, PlanDayExercise } from '@/types/domain'
import type { SavePlanPayload } from './types'

export async function fetchOwnPlans(ownerId: string): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export interface AssignedPlan {
  plan_id: string
  active: boolean
  plans: Plan
}

export async function fetchAssignedPlans(clientId: string): Promise<AssignedPlan[]> {
  const { data, error } = await supabase
    .from('plan_assignments')
    .select('plan_id, active, plans(*)')
    .eq('client_id', clientId)
    .eq('active', true)
  if (error) throw error
  return data as unknown as AssignedPlan[]
}

export type PlanDayExerciseWithExercise = PlanDayExercise & { exercises: Exercise }
export type PlanDayWithExercises = PlanDay & { plan_day_exercises: PlanDayExerciseWithExercise[] }
export type PlanDetail = Plan & { plan_days: PlanDayWithExercises[] }

export async function fetchPlanDetail(planId: string): Promise<PlanDetail | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*, plan_days(*, plan_day_exercises(*, exercises(*)))')
    .eq('id', planId)
    .order('day_order', { referencedTable: 'plan_days' })
    .order('exercise_order', { referencedTable: 'plan_days.plan_day_exercises' })
    .maybeSingle()
  if (error) throw error
  return data as unknown as PlanDetail | null
}

export async function savePlan(payload: SavePlanPayload): Promise<string> {
  const { data, error } = await supabase.rpc('save_plan', { payload: payload as unknown as Json })
  if (error) throw error
  return data
}

export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase.from('plans').delete().eq('id', planId)
  if (error) throw error
}
