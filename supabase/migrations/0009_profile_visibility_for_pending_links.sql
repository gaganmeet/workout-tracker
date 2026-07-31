-- Bug: profiles_select only granted cross-visibility once a coach_client_links
-- row reached status='approved'. That broke the "find a coach" flow: a client
-- who just sent a pending request couldn't re-fetch the coach's profile (e.g.
-- via a nested `coach:profiles(...)` embed on their own links), because
-- is_approved_coach_of/is_approved_client_of both require status='approved'.
--
-- Fix: profile visibility between two parties should track "does *any*
-- coach_client_links row exist between them" (pending/approved/rejected/
-- revoked), not just approved ones. Actual data access (plans, workouts,
-- notes) still correctly requires status='approved' via the existing
-- is_approved_coach_of/is_approved_client_of checks elsewhere -- this only
-- widens visibility of the low-sensitivity profiles table.

create or replace function private.has_coach_client_relationship(p_other_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.coach_client_links
    where (coach_id = (select auth.uid()) and client_id = p_other_id)
       or (client_id = (select auth.uid()) and coach_id = p_other_id)
  );
$$;

revoke all on function private.has_coach_client_relationship(uuid) from public;
grant execute on function private.has_coach_client_relationship(uuid) to authenticated;

drop policy "profiles_select" on public.profiles;

create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or private.has_coach_client_relationship(id)
  );
