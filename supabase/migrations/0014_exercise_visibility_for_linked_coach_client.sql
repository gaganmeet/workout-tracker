-- Bug: exercises_select_global_or_own only allows a custom exercise's own
-- creator to see it. When a coach builds a plan using a custom exercise they
-- created and assigns it to a client, the client's plan_day_exercises query
-- embeds exercises via FK -- PostgREST doesn't filter the outer row when RLS
-- denies the embedded relation, it nulls the relation out instead. The
-- client's PlanDetailPage then read `exercise.exercises.name` off that null
-- and crashed. Same problem in reverse if a client's own custom exercise
-- shows up in something their coach views.
--
-- Fix: extend visibility to an approved coach/client of the exercise's
-- creator, mirroring the existing profiles_select_linked pattern (0003).

drop policy "exercises_select_global_or_own" on public.exercises;

create policy "exercises_select_global_own_or_linked"
  on public.exercises for select
  to authenticated
  using (
    created_by is null
    or created_by = (select auth.uid())
    or private.is_approved_coach_of(created_by)
    or private.is_approved_client_of(created_by)
  );
