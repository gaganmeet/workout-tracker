import { supabase } from '@/lib/supabase/client'
import type { CoachClientLink, Profile, WorkoutSession } from '@/types/domain'

export interface CoachSearchResult {
  id: string
  username: string
  display_name: string | null
}

export async function searchCoaches(query: string): Promise<CoachSearchResult[]> {
  const { data, error } = await supabase.rpc('search_coaches', { query })
  if (error) throw error
  return data
}

export type LinkWithCoach = CoachClientLink & { coach: Profile }
export type LinkWithClient = CoachClientLink & { client: Profile }

export async function fetchMyLinks(clientId: string): Promise<LinkWithCoach[]> {
  const { data, error } = await supabase
    .from('coach_client_links')
    .select('*, coach:profiles!coach_client_links_coach_id_fkey(*)')
    .eq('client_id', clientId)
    .order('requested_at', { ascending: false })
  if (error) throw error
  return data as unknown as LinkWithCoach[]
}

export async function sendLinkRequest(coachId: string, clientId: string): Promise<void> {
  const { error } = await supabase
    .from('coach_client_links')
    .insert({ coach_id: coachId, client_id: clientId, requested_by: clientId, status: 'pending' })
  if (error) throw error
}

export async function cancelLink(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('coach_client_links')
    .update({ status: 'rejected', responded_at: new Date().toISOString() })
    .eq('id', linkId)
  if (error) throw error
}

export async function fetchPendingRequests(coachId: string): Promise<LinkWithClient[]> {
  const { data, error } = await supabase
    .from('coach_client_links')
    .select('*, client:profiles!coach_client_links_client_id_fkey(*)')
    .eq('coach_id', coachId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })
  if (error) throw error
  return data as unknown as LinkWithClient[]
}

export async function fetchApprovedClients(coachId: string): Promise<LinkWithClient[]> {
  const { data, error } = await supabase
    .from('coach_client_links')
    .select('*, client:profiles!coach_client_links_client_id_fkey(*)')
    .eq('coach_id', coachId)
    .eq('status', 'approved')
    .order('responded_at', { ascending: false })
  if (error) throw error
  return data as unknown as LinkWithClient[]
}

export async function respondToRequest(
  linkId: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  const { error } = await supabase
    .from('coach_client_links')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', linkId)
  if (error) throw error
}

export async function fetchClientProfile(clientId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', clientId).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchClientSessions(clientId: string, limit = 20): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', clientId)
    .order('started_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function assignPlanToClient(
  planId: string,
  clientId: string,
  assignedBy: string,
): Promise<void> {
  const { error } = await supabase
    .from('plan_assignments')
    .upsert(
      { plan_id: planId, client_id: clientId, assigned_by: assignedBy, active: true },
      { onConflict: 'plan_id,client_id' },
    )
  if (error) throw error
}

export async function fetchPlansAssignedToClient(coachId: string, clientId: string) {
  const { data, error } = await supabase
    .from('plan_assignments')
    .select('plan_id, active, plans(*)')
    .eq('assigned_by', coachId)
    .eq('client_id', clientId)
    .eq('active', true)
  if (error) throw error
  return data
}
