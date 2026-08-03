import { supabase } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/database.types'
import type { Exercise, Plan, PlanDay, PlanDayExercise, Profile } from '@/types/domain'
import type { SavePlanPayload } from './types'

export type PlanDaySummary = Pick<PlanDay, 'id' | 'name' | 'day_order'>
export type PlanStarRef = { user_id: string }
export type PlanWithDays = Plan & { plan_days: PlanDaySummary[]; plan_stars: PlanStarRef[] }

export async function fetchOwnPlans(ownerId: string): Promise<PlanWithDays[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*, plan_days(id, name, day_order), plan_stars(user_id)')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false })
    .order('day_order', { referencedTable: 'plan_days' })
  if (error) throw error
  return data as unknown as PlanWithDays[]
}

export interface AssignedPlan {
  plan_id: string
  active: boolean
  plans: PlanWithDays & { profiles: Pick<Profile, 'id' | 'display_name' | 'username'> | null }
}

export async function fetchAssignedPlans(clientId: string): Promise<AssignedPlan[]> {
  const { data, error } = await supabase
    .from('plan_assignments')
    .select(
      'plan_id, active, plans(*, profiles!plans_owner_id_fkey(id, display_name, username), plan_days(id, name, day_order), plan_stars(user_id))',
    )
    .eq('client_id', clientId)
    .eq('active', true)
    .order('day_order', { referencedTable: 'plans.plan_days' })
  if (error) throw error
  return data as unknown as AssignedPlan[]
}

export type PublicPlan = PlanWithDays & { profiles: Pick<Profile, 'id' | 'display_name' | 'username'> | null }

// Star count isn't a real column PostgREST can ORDER BY, so we fetch the
// full star list per plan (small in practice) and sort client-side --
// avoids a denormalized counter + trigger for what's a cheap in-memory sort
// at this scale.
export async function fetchPublicPlans(): Promise<PublicPlan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*, profiles!plans_owner_id_fkey(id, display_name, username), plan_days(id, name, day_order), plan_stars(user_id)')
    .eq('is_public', true)
    .order('day_order', { referencedTable: 'plan_days' })
  if (error) throw error
  const plans = data as unknown as PublicPlan[]
  return plans.sort((a, b) => b.plan_stars.length - a.plan_stars.length)
}

export async function fetchPublicPlansByOwner(ownerId: string): Promise<PublicPlan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*, profiles!plans_owner_id_fkey(id, display_name, username), plan_days(id, name, day_order), plan_stars(user_id)')
    .eq('is_public', true)
    .eq('owner_id', ownerId)
    .order('day_order', { referencedTable: 'plan_days' })
  if (error) throw error
  const plans = data as unknown as PublicPlan[]
  return plans.sort((a, b) => b.plan_stars.length - a.plan_stars.length)
}

export async function togglePlanPublic(planId: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase.from('plans').update({ is_public: isPublic }).eq('id', planId)
  if (error) throw error
}

export async function starPlan(userId: string, planId: string): Promise<void> {
  const { error } = await supabase.from('plan_stars').insert({ user_id: userId, plan_id: planId })
  if (error) throw error
}

export async function unstarPlan(userId: string, planId: string): Promise<void> {
  const { error } = await supabase.from('plan_stars').delete().eq('user_id', userId).eq('plan_id', planId)
  if (error) throw error
}

export type PlanDayExerciseWithExercise = PlanDayExercise & { exercises: Exercise }
export type PlanDayWithExercises = PlanDay & { plan_day_exercises: PlanDayExerciseWithExercise[] }
export type PlanDetail = Plan & { plan_days: PlanDayWithExercises[]; plan_stars: PlanStarRef[] }

export async function fetchPlanDetail(planId: string): Promise<PlanDetail | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*, plan_days(*, plan_day_exercises(*, exercises(*))), plan_stars(user_id)')
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

// Reads whatever plan the caller has read access to (own, a linked coach's
// client's plan, or one assigned to them) and saves it as a brand new plan.
// save_plan always owns the new row by the calling user's own auth.uid(),
// never a client-supplied value, so duplicating a coach-assigned plan
// naturally becomes the athlete's own editable copy -- no separate
// "new owner" param needed.
export async function duplicatePlan(planId: string): Promise<string> {
  const source = await fetchPlanDetail(planId)
  if (!source) throw new Error('Plan not found')

  const payload: SavePlanPayload = {
    name: `${source.name} (copy)`,
    description: source.description ?? undefined,
    days: source.plan_days.map((day) => ({
      name: day.name,
      day_order: day.day_order,
      exercises: day.plan_day_exercises.map((exercise) => ({
        exercise_id: exercise.exercise_id,
        exercise_order: exercise.exercise_order,
        target_sets: exercise.target_sets,
        target_reps_min: exercise.target_reps_min,
        target_reps_max: exercise.target_reps_max,
        target_rpe: exercise.target_rpe,
        notes: exercise.notes,
      })),
    })),
  }

  return savePlan(payload)
}
