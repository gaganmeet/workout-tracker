-- exercise_notes: a coach's note to a client on a specific exercise, scoped
-- to either a planned slot (plan_day_exercise) or a logged instance
-- (workout_exercise). Read by both parties, writable only by the coach.

create table public.exercise_notes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  plan_day_exercise_id uuid references public.plan_day_exercises (id) on delete cascade,
  workout_exercise_id uuid references public.workout_exercises (id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_notes_one_target check (
    num_nonnulls(plan_day_exercise_id, workout_exercise_id) = 1
  )
);

create index exercise_notes_client_idx on public.exercise_notes (client_id);
create index exercise_notes_coach_idx on public.exercise_notes (coach_id);
create index exercise_notes_plan_day_exercise_idx on public.exercise_notes (plan_day_exercise_id);
create index exercise_notes_workout_exercise_idx on public.exercise_notes (workout_exercise_id);

alter table public.exercise_notes enable row level security;

create policy "exercise_notes_select_participant"
  on public.exercise_notes for select
  to authenticated
  using (coach_id = (select auth.uid()) or client_id = (select auth.uid()));

-- Only an approved coach of the client can write notes for that client.
-- No policy grants client_id = (select auth.uid()) write access, which is what makes
-- notes read-only for athletes.
create policy "exercise_notes_insert_coach"
  on public.exercise_notes for insert
  to authenticated
  with check (coach_id = (select auth.uid()) and private.is_approved_coach_of(client_id));

create policy "exercise_notes_update_coach"
  on public.exercise_notes for update
  to authenticated
  using (coach_id = (select auth.uid()))
  with check (coach_id = (select auth.uid()) and private.is_approved_coach_of(client_id));

create policy "exercise_notes_delete_coach"
  on public.exercise_notes for delete
  to authenticated
  using (coach_id = (select auth.uid()));
