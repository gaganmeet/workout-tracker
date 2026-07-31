-- exercises: global seeded rows (created_by is null) plus per-user custom rows.

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group public.muscle_group,
  equipment public.equipment_type,
  created_by uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index exercises_created_by_idx on public.exercises (created_by);

-- Case-insensitive uniqueness per scope: one global "Bench Press", and one
-- per-user "Bench Press" custom variant, without cross-scope collisions.
create unique index exercises_global_name_uidx
  on public.exercises (lower(name)) where created_by is null;
create unique index exercises_user_name_uidx
  on public.exercises (created_by, lower(name)) where created_by is not null;

alter table public.exercises enable row level security;

-- RLS: everyone sees the global library plus their own custom exercises.
-- Global rows are seeded via supabase/seed.sql under the service role
-- (which bypasses RLS), never inserted by users directly.

create policy "exercises_select_global_or_own"
  on public.exercises for select
  to authenticated
  using (created_by is null or created_by = (select auth.uid()));

create policy "exercises_insert_own"
  on public.exercises for insert
  to authenticated
  with check (created_by = (select auth.uid()));

create policy "exercises_update_own"
  on public.exercises for update
  to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

create policy "exercises_delete_own"
  on public.exercises for delete
  to authenticated
  using (created_by = (select auth.uid()));
