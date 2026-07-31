-- Adds a tutorial video link to exercises (one per exercise, shared across
-- every plan/workout that uses it -- not scoped to a single plan).
--
-- Ordinary column ownership rules (exercises_update_own) still gate name/
-- muscle_group/equipment: only the row's creator can touch those, and
-- global seeded exercises (created_by is null) aren't owned by anyone, so
-- no user could ever set a video via a plain UPDATE. Since a tutorial link
-- is low-stakes shared enrichment (not identifying data), video_url is
-- carved out via a dedicated RPC that lets any authenticated user set it on
-- *any* exercise, global or custom, without granting broader write access.

alter table public.exercises add column video_url text;

create or replace function public.set_exercise_video_url(p_exercise_id uuid, p_video_url text)
returns public.exercises
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exercise public.exercises;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.exercises
  set video_url = nullif(trim(p_video_url), '')
  where id = p_exercise_id
  returning * into v_exercise;

  if not found then
    raise exception 'Exercise not found';
  end if;

  return v_exercise;
end;
$$;

revoke all on function public.set_exercise_video_url(uuid, text) from public, anon;
grant execute on function public.set_exercise_video_url(uuid, text) to authenticated;
