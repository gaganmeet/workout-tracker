-- Bug found while live-verifying 0018: profiles are now a fully public
-- directory, but workout_sessions RLS is still owner/coach-only, so the
-- activity heatmap on someone else's profile came back empty for any
-- visitor who isn't their coach. Rather than broadly expose full session
-- rows (name, notes) to any authenticated user just to compute a heatmap,
-- this SECURITY DEFINER function bypasses RLS internally but only ever
-- returns a (day, count) aggregate -- no session content leaks regardless
-- of caller, matching the private-schema-helper pattern used elsewhere for
-- controlled cross-table visibility.
--
-- Grouping runs in the database's UTC day, not the viewer's local day
-- (unlike a client-side group-by) -- an acceptable imprecision (only
-- matters right at a midnight boundary) for what's a browsing feature, not
-- a source of truth the app relies on elsewhere.
create or replace function public.get_workout_activity(p_user_id uuid, p_since timestamptz)
returns table (day date, count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select started_at::date as day, count(*)
  from public.workout_sessions
  where user_id = p_user_id and started_at >= p_since
  group by 1
  order by 1;
$$;

revoke all on function public.get_workout_activity(uuid, timestamptz) from public;
grant execute on function public.get_workout_activity(uuid, timestamptz) to authenticated;
