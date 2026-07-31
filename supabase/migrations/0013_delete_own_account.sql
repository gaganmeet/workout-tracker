-- Self-service account deletion. Client code has no access to auth.users
-- directly (not exposed via the Data API, and the admin API that could
-- delete a user requires the service_role key, which must never reach a
-- client). A SECURITY DEFINER function running as the table owner can
-- delete from auth.users directly, but is scoped to ONLY the caller's own
-- row (auth.uid(), not a parameter) so it can never be used to delete
-- someone else's account. Every other table's FK to profiles already
-- cascades (verified in 0010's cascade audit), so this one delete cleans up
-- everything: profile, custom exercises, plans, workout history, coach
-- links, notes.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- Bug found while testing the above: deleting a user cascades to delete
-- their custom exercises (exercises.created_by), but plan_day_exercises,
-- workout_exercises, and exercise_notes referenced exercises(id) with the
-- default NO ACTION -- so the cascade fails with a foreign key violation
-- unless every referencing row already happened to be cleared by some
-- *other* cascade path first (order-dependent and unreliable, since
-- Postgres doesn't defer these checks across independent cascade paths).
-- There's currently no UI path to delete a single custom exercise while
-- keeping the account, so cascading here only ever fires as part of a full
-- account wipe, where deleting everything that referenced it is exactly
-- the intended behavior.

alter table public.plan_day_exercises
  drop constraint plan_day_exercises_exercise_id_fkey,
  add constraint plan_day_exercises_exercise_id_fkey
    foreign key (exercise_id) references public.exercises (id) on delete cascade;

alter table public.workout_exercises
  drop constraint workout_exercises_exercise_id_fkey,
  add constraint workout_exercises_exercise_id_fkey
    foreign key (exercise_id) references public.exercises (id) on delete cascade;

alter table public.exercise_notes
  drop constraint exercise_notes_exercise_id_fkey,
  add constraint exercise_notes_exercise_id_fkey
    foreign key (exercise_id) references public.exercises (id) on delete cascade;
