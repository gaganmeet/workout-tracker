-- Athlete's own free-text note per exercise within a logged workout (e.g.
-- "felt heavy today", "left shoulder tight on set 3") -- distinct from
-- exercise_notes, which is coach-authored and read-only for the athlete.
--
-- No new RLS policies needed: workout_exercises_update_via_owner (session
-- owner only) already covers writes, and the existing SELECT policy
-- (owner + is_approved_coach_of) already covers reads -- a coach reviewing
-- a client's history can see what the client noted, same as with sets.

alter table public.workout_exercises add column notes text;
