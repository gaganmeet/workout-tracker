-- Bug: coach_client_links.requested_by and plan_assignments.assigned_by
-- referenced profiles(id) without ON DELETE CASCADE (unlike every other FK
-- to profiles in the schema). That leaves them as NO ACTION, which blocks
-- deleting a profile/auth user entirely as soon as they've ever requested a
-- link or assigned a plan -- surfaced when trying to delete a test coach
-- account: "update or delete on table profiles violates foreign key
-- constraint plan_assignments_assigned_by_fkey ... still referenced".
--
-- Fix: cascade both, matching the rest of the schema's convention that a
-- deleted profile takes their owned/authored rows with them.

alter table public.coach_client_links
  drop constraint coach_client_links_requested_by_fkey,
  add constraint coach_client_links_requested_by_fkey
    foreign key (requested_by) references public.profiles (id) on delete cascade;

alter table public.plan_assignments
  drop constraint plan_assignments_assigned_by_fkey,
  add constraint plan_assignments_assigned_by_fkey
    foreign key (assigned_by) references public.profiles (id) on delete cascade;
