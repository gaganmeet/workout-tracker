-- Public plan library: an owner can flag their plan public so any
-- authenticated user can view it and duplicate it into their own account
-- ("assign to self" -- reuses the existing duplicate-plan flow, since
-- duplicating already always creates a new plan owned by the caller).
-- New column defaults to false, so every existing plan stays private with
-- no backfill needed.

alter table public.plans add column is_public boolean not null default false;

create policy "plans_select_public"
  on public.plans for select
  to authenticated
  using (is_public = true);

-- A public plan can reference a custom exercise the viewer has no other
-- relationship to -- same class of visibility gap fixed in 0014 for
-- coach/client links, just for the public-library path instead.
create policy "exercises_select_via_public_plan"
  on public.exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.plan_day_exercises pde
      join public.plan_days pd on pd.id = pde.plan_day_id
      join public.plans p on p.id = pd.plan_id
      where pde.exercise_id = exercises.id and p.is_public = true
    )
  );

-- save_plan: accept is_public in the payload so a plan can be published (or
-- unpublished) directly from the editor. On update, a payload that omits the
-- key leaves the existing value alone rather than silently unpublishing.
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
          is_public = coalesce((payload ->> 'is_public')::boolean, is_public),
          updated_at = now()
      where id = v_plan_id and owner_id = v_owner_id;

    if not found then
      raise exception 'Plan not found or not owned by caller';
    end if;

    delete from public.plan_days where plan_id = v_plan_id;
  else
    insert into public.plans (owner_id, name, description, is_public)
    values (v_owner_id, payload ->> 'name', payload ->> 'description', coalesce((payload ->> 'is_public')::boolean, false))
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
