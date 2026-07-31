-- workout_sessions / workout_exercises / sets: an actual instance of doing a
-- workout, with per-set weight/reps/RPE logging (Strong-app style).

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_day_id uuid references public.plan_days (id) on delete set null,
  name text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index workout_sessions_user_idx on public.workout_sessions (user_id);
create index workout_sessions_plan_day_idx on public.workout_sessions (plan_day_id);

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  plan_day_exercise_id uuid references public.plan_day_exercises (id) on delete set null,
  exercise_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index workout_exercises_session_idx on public.workout_exercises (workout_session_id);
create index workout_exercises_exercise_idx on public.workout_exercises (exercise_id);
create index workout_exercises_plan_day_exercise_idx on public.workout_exercises (plan_day_exercise_id);

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  set_order smallint not null default 0,
  weight numeric(6, 2),
  reps smallint,
  rpe numeric(3, 1) check (rpe is null or (rpe between 0 and 10)),
  is_warmup boolean not null default false,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index sets_workout_exercise_idx on public.sets (workout_exercise_id);

alter table public.workout_sessions enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.sets enable row level security;

-- RLS: workout_sessions
-- Athletes only ever log their own workouts; a linked coach may view
-- (read-only) a client's sessions.

create policy "workout_sessions_select_owner_or_coach"
  on public.workout_sessions for select
  to authenticated
  using (user_id = (select auth.uid()) or private.is_approved_coach_of(user_id));

create policy "workout_sessions_write_owner"
  on public.workout_sessions for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- RLS: workout_exercises / sets delegate to the parent session's own rules.

create policy "workout_exercises_select_via_session"
  on public.workout_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercises.workout_session_id
        and (ws.user_id = (select auth.uid()) or private.is_approved_coach_of(ws.user_id))
    )
  );

create policy "workout_exercises_write_via_owner"
  on public.workout_exercises for all
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

create policy "sets_select_via_session"
  on public.sets for select
  to authenticated
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workout_sessions ws on ws.id = we.workout_session_id
      where we.id = sets.workout_exercise_id
        and (ws.user_id = (select auth.uid()) or private.is_approved_coach_of(ws.user_id))
    )
  );

create policy "sets_write_via_owner"
  on public.sets for all
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
