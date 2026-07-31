-- Addresses findings from `supabase db advisors` after the initial push:
--
-- 1. RPC functions were still callable by the `anon` role. Supabase grants
--    EXECUTE on new `public` functions directly to anon/authenticated (not
--    only via the PUBLIC pseudo-role), so `revoke ... from public` in the
--    earlier migrations didn't touch that separate direct grant.
-- 2. Three foreign key columns had no covering index.
-- 3. Several tables had multiple permissive policies for the same
--    role+command (e.g. a broad "select" policy plus a "for all" owner
--    policy that also grants select) -- correct, but Postgres evaluates
--    every applicable permissive policy per query, so this is wasted work.
--    Fixed by merging pure-select policies into one, and splitting "for
--    all" owner policies into insert/update/delete only so they stop
--    contributing a second, redundant SELECT policy.

-- --- 1. Lock down RPC-callable functions to `authenticated` only ---

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.save_plan(jsonb) from anon;
revoke execute on function public.search_coaches(text) from anon;

-- --- 2. Missing FK indexes ---

create index if not exists coach_client_links_requested_by_idx on public.coach_client_links (requested_by);
create index if not exists exercise_notes_exercise_id_idx on public.exercise_notes (exercise_id);
create index if not exists plan_assignments_assigned_by_idx on public.plan_assignments (assigned_by);

-- --- 3a. coach_client_links: merge the two-policy UPDATE split into one
--     policy with an OR'd WITH CHECK, preserving the exact same security
--     property (a client can never set status to 'approved') in a single
--     permissive policy instead of two. ---

drop policy "links_coach_respond" on public.coach_client_links;
drop policy "links_client_cancel_or_revoke" on public.coach_client_links;

create policy "links_update_participant"
  on public.coach_client_links for update
  to authenticated
  using (coach_id = (select auth.uid()) or client_id = (select auth.uid()))
  with check (
    (coach_id = (select auth.uid()) and status in ('approved', 'rejected', 'revoked'))
    or (client_id = (select auth.uid()) and status in ('rejected', 'revoked'))
  );

-- --- 3b. profiles: merge the two SELECT policies into one ---

drop policy "profiles_select_self" on public.profiles;
drop policy "profiles_select_linked" on public.profiles;

create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or private.is_approved_coach_of(id)
    or private.is_approved_client_of(id)
  );

-- --- 3c. plans: merge the three SELECT policies into one ---

drop policy "plans_select_owner" on public.plans;
drop policy "plans_select_coach_of_owner" on public.plans;
drop policy "plans_select_assigned_client" on public.plans;

create policy "plans_select"
  on public.plans for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or private.is_approved_coach_of(owner_id)
    or private.is_plan_assigned_to_caller(id)
  );

-- --- 3d. plan_days / plan_day_exercises / workout_sessions /
--     workout_exercises / sets: each had a broad "select via parent" policy
--     plus a "for all" owner policy that implicitly duplicated SELECT.
--     Split the "for all" policies into insert/update/delete only so each
--     table has exactly one applicable SELECT policy. ---

drop policy "plan_days_write_via_owner" on public.plan_days;

create policy "plan_days_insert_via_owner"
  on public.plan_days for insert
  to authenticated
  with check (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.owner_id = (select auth.uid())
    )
  );

create policy "plan_days_update_via_owner"
  on public.plan_days for update
  to authenticated
  using (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.owner_id = (select auth.uid())
    )
  );

create policy "plan_days_delete_via_owner"
  on public.plan_days for delete
  to authenticated
  using (
    exists (
      select 1 from public.plans
      where plans.id = plan_days.plan_id and plans.owner_id = (select auth.uid())
    )
  );

drop policy "plan_day_exercises_write_via_owner" on public.plan_day_exercises;

create policy "plan_day_exercises_insert_via_owner"
  on public.plan_day_exercises for insert
  to authenticated
  with check (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_day_exercises.plan_day_id
        and plans.owner_id = (select auth.uid())
    )
  );

create policy "plan_day_exercises_update_via_owner"
  on public.plan_day_exercises for update
  to authenticated
  using (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_day_exercises.plan_day_id
        and plans.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_day_exercises.plan_day_id
        and plans.owner_id = (select auth.uid())
    )
  );

create policy "plan_day_exercises_delete_via_owner"
  on public.plan_day_exercises for delete
  to authenticated
  using (
    exists (
      select 1 from public.plan_days
      join public.plans on plans.id = plan_days.plan_id
      where plan_days.id = plan_day_exercises.plan_day_id
        and plans.owner_id = (select auth.uid())
    )
  );

drop policy "workout_sessions_write_owner" on public.workout_sessions;

create policy "workout_sessions_insert_owner"
  on public.workout_sessions for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "workout_sessions_update_owner"
  on public.workout_sessions for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "workout_sessions_delete_owner"
  on public.workout_sessions for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy "workout_exercises_write_via_owner" on public.workout_exercises;

create policy "workout_exercises_insert_via_owner"
  on public.workout_exercises for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercises.workout_session_id and ws.user_id = (select auth.uid())
    )
  );

create policy "workout_exercises_update_via_owner"
  on public.workout_exercises for update
  to authenticated
  using (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercises.workout_session_id and ws.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercises.workout_session_id and ws.user_id = (select auth.uid())
    )
  );

create policy "workout_exercises_delete_via_owner"
  on public.workout_exercises for delete
  to authenticated
  using (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercises.workout_session_id and ws.user_id = (select auth.uid())
    )
  );

drop policy "sets_write_via_owner" on public.sets;

create policy "sets_insert_via_owner"
  on public.sets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_sessions ws on ws.id = we.workout_session_id
      where we.id = sets.workout_exercise_id and ws.user_id = (select auth.uid())
    )
  );

create policy "sets_update_via_owner"
  on public.sets for update
  to authenticated
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_sessions ws on ws.id = we.workout_session_id
      where we.id = sets.workout_exercise_id and ws.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_sessions ws on ws.id = we.workout_session_id
      where we.id = sets.workout_exercise_id and ws.user_id = (select auth.uid())
    )
  );

create policy "sets_delete_via_owner"
  on public.sets for delete
  to authenticated
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_sessions ws on ws.id = we.workout_session_id
      where we.id = sets.workout_exercise_id and ws.user_id = (select auth.uid())
    )
  );
