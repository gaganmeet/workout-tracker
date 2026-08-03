-- Gyms: an optional, per-user tag on a workout session. Lets weight
-- placeholders and progress charts distinguish "same exercise, different
-- machine" across locations instead of conflating them into one history.

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index gyms_owner_idx on public.gyms (owner_id);
create unique index gyms_owner_name_uidx on public.gyms (owner_id, lower(name));

alter table public.gyms enable row level security;

-- A coach can see a linked client's gym names (needed to render them on a
-- client's workout history/detail, which a coach already has read access
-- to), same pattern as exercises_select_global_own_or_linked.
create policy "gyms_select_own_or_coach"
  on public.gyms for select
  to authenticated
  using (owner_id = (select auth.uid()) or private.is_approved_coach_of(owner_id));

create policy "gyms_insert_own"
  on public.gyms for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "gyms_update_own"
  on public.gyms for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "gyms_delete_own"
  on public.gyms for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- Nullable + on delete set null: deleting a gym just untags past sessions,
-- never deletes workout history. Rides workout_sessions' existing
-- owner-only RLS, no policy changes needed there.
alter table public.workout_sessions
  add column gym_id uuid references public.gyms (id) on delete set null;

create index workout_sessions_gym_idx on public.workout_sessions (gym_id);
