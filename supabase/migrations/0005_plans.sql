-- plans / plan_days / plan_day_exercises: reusable plan templates
-- (Plan -> Days -> Exercises). plan_assignments links a coach-owned plan to
-- one or more clients.

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index plans_owner_idx on public.plans (owner_id);

create table public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  name text not null,
  day_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index plan_days_plan_idx on public.plan_days (plan_id);

create table public.plan_day_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  exercise_order smallint not null default 0,
  target_sets smallint,
  target_reps_min smallint,
  target_reps_max smallint,
  target_rpe numeric(3, 1) check (target_rpe is null or (target_rpe between 0 and 10)),
  notes text,
  created_at timestamptz not null default now()
);

create index plan_day_exercises_plan_day_idx on public.plan_day_exercises (plan_day_id);
create index plan_day_exercises_exercise_idx on public.plan_day_exercises (exercise_id);

create table public.plan_assignments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid not null references public.profiles (id),
  assigned_at timestamptz not null default now(),
  active boolean not null default true,
  constraint plan_assignments_unique unique (plan_id, client_id)
);

create index plan_assignments_client_idx on public.plan_assignments (client_id);
create index plan_assignments_plan_idx on public.plan_assignments (plan_id);

alter table public.plans enable row level security;
alter table public.plan_days enable row level security;
alter table public.plan_day_exercises enable row level security;
alter table public.plan_assignments enable row level security;

-- Helper functions to break the mutual-recursion cycle between plans and
-- plan_assignments: each table's RLS references the other, and a raw EXISTS
-- subquery against the other table re-triggers its RLS, which references
-- the first table again ("infinite recursion detected in policy"). Routing
-- the cross-table check through a SECURITY DEFINER function makes that
-- internal lookup run as the function owner (bypassing RLS on the read),
-- which breaks the cycle while the outer, top-level query a user actually
-- issues is still fully subject to RLS as normal. Kept in `private` (not
-- exposed via the Data API) since these are only ever used inside policies.

create or replace function private.owns_plan(p_plan_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.plans where id = p_plan_id and owner_id = (select auth.uid())
  );
$$;

create or replace function private.is_plan_assigned_to_caller(p_plan_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.plan_assignments where plan_id = p_plan_id and client_id = (select auth.uid())
  );
$$;

revoke all on function private.owns_plan(uuid) from public;
revoke all on function private.is_plan_assigned_to_caller(uuid) from public;
grant execute on function private.owns_plan(uuid) to authenticated;
grant execute on function private.is_plan_assigned_to_caller(uuid) to authenticated;

-- RLS: plans
-- Owner sees/writes their own plans. A coach also sees a linked client's own
-- plans (read-only). A client also sees plans assigned to them by a coach.

create policy "plans_select_owner"
  on public.plans for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "plans_select_coach_of_owner"
  on public.plans for select
  to authenticated
  using (private.is_approved_coach_of(owner_id));

create policy "plans_select_assigned_client"
  on public.plans for select
  to authenticated
  using (private.is_plan_assigned_to_caller(plans.id));

create policy "plans_insert_owner"
  on public.plans for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "plans_update_owner"
  on public.plans for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "plans_delete_owner"
  on public.plans for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- RLS: plan_days / plan_day_exercises delegate to the parent plan's own
-- (already-defined) visibility and ownership rules.

create policy "plan_days_select_via_plan"
  on public.plan_days for select
  to authenticated
  using (exists (select 1 from public.plans where plans.id = plan_days.plan_id));

create policy "plan_days_write_via_owner"
  on public.plan_days for all
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

create policy "plan_day_exercises_select_via_plan"
  on public.plan_day_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.plan_days
      where plan_days.id = plan_day_exercises.plan_day_id
    )
  );

create policy "plan_day_exercises_write_via_owner"
  on public.plan_day_exercises for all
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

-- RLS: plan_assignments

create policy "plan_assignments_select_participant"
  on public.plan_assignments for select
  to authenticated
  using (
    client_id = (select auth.uid())
    or assigned_by = (select auth.uid())
    or private.owns_plan(plan_assignments.plan_id)
  );

create policy "plan_assignments_insert_coach"
  on public.plan_assignments for insert
  to authenticated
  with check (
    assigned_by = (select auth.uid())
    and private.is_approved_coach_of(client_id)
    and private.owns_plan(plan_assignments.plan_id)
  );

-- WITH CHECK re-verifies plan ownership and coach-of-client on the *new*
-- row, not just assigned_by -- otherwise an assigner could UPDATE plan_id or
-- client_id to point at a plan/client they have no relationship to (the
-- INSERT policy's checks would only ever have applied at creation time).
create policy "plan_assignments_update_assigner"
  on public.plan_assignments for update
  to authenticated
  using (assigned_by = (select auth.uid()))
  with check (
    assigned_by = (select auth.uid())
    and private.owns_plan(plan_id)
    and private.is_approved_coach_of(client_id)
  );

create policy "plan_assignments_delete_assigner"
  on public.plan_assignments for delete
  to authenticated
  using (assigned_by = (select auth.uid()));

-- save_plan: upserts a plan + its days + exercises in one call (create when
-- payload has no "id", update otherwise), since supabase-js has no
-- client-side transaction support for multi-table writes. SECURITY DEFINER
-- so it can bypass RLS internally, but ownership/coach-of-client checks are
-- enforced explicitly in the function body rather than trusted from payload.
-- Lives in public and is RPC-callable (supabase.rpc('save_plan', ...)).
--
-- payload shape:
-- {
--   "id"?: uuid,
--   "name": string,
--   "description"?: string,
--   "assign_client_id"?: uuid,
--   "days": [
--     {
--       "name": string,
--       "day_order": number,
--       "exercises": [
--         {
--           "exercise_id": uuid,
--           "exercise_order": number,
--           "target_sets"?: number,
--           "target_reps_min"?: number,
--           "target_reps_max"?: number,
--           "target_rpe"?: number,
--           "notes"?: string
--         }
--       ]
--     }
--   ]
-- }
create or replace function public.save_plan(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid := auth.uid();
  v_plan_id uuid;
  v_day jsonb;
  v_day_id uuid;
  v_ex jsonb;
  v_client_id uuid;
begin
  if v_owner_id is null then
    raise exception 'Not authenticated';
  end if;

  if (payload ->> 'id') is not null then
    v_plan_id := (payload ->> 'id')::uuid;

    update public.plans
      set name = payload ->> 'name',
          description = payload ->> 'description',
          updated_at = now()
      where id = v_plan_id and owner_id = v_owner_id;

    if not found then
      raise exception 'Plan not found or not owned by caller';
    end if;

    delete from public.plan_days where plan_id = v_plan_id;
  else
    insert into public.plans (owner_id, name, description)
    values (v_owner_id, payload ->> 'name', payload ->> 'description')
    returning id into v_plan_id;
  end if;

  for v_day in select * from jsonb_array_elements(coalesce(payload -> 'days', '[]'::jsonb))
  loop
    insert into public.plan_days (plan_id, name, day_order)
    values (v_plan_id, v_day ->> 'name', coalesce((v_day ->> 'day_order')::smallint, 0))
    returning id into v_day_id;

    for v_ex in select * from jsonb_array_elements(coalesce(v_day -> 'exercises', '[]'::jsonb))
    loop
      insert into public.plan_day_exercises (
        plan_day_id, exercise_id, exercise_order,
        target_sets, target_reps_min, target_reps_max, target_rpe, notes
      ) values (
        v_day_id,
        (v_ex ->> 'exercise_id')::uuid,
        coalesce((v_ex ->> 'exercise_order')::smallint, 0),
        (v_ex ->> 'target_sets')::smallint,
        (v_ex ->> 'target_reps_min')::smallint,
        (v_ex ->> 'target_reps_max')::smallint,
        (v_ex ->> 'target_rpe')::numeric,
        v_ex ->> 'notes'
      );
    end loop;
  end loop;

  if (payload ->> 'assign_client_id') is not null then
    v_client_id := (payload ->> 'assign_client_id')::uuid;

    if not private.is_approved_coach_of(v_client_id) then
      raise exception 'Not an approved coach of this client';
    end if;

    insert into public.plan_assignments (plan_id, client_id, assigned_by)
    values (v_plan_id, v_client_id, v_owner_id)
    on conflict (plan_id, client_id) do update set active = true;
  end if;

  return v_plan_id;
end;
$$;

revoke all on function public.save_plan(jsonb) from public;
grant execute on function public.save_plan(jsonb) to authenticated;
