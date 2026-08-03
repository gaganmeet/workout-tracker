-- Profile page: optional bio, an avatar image, a GitHub-style "days worked
-- out" activity view (computed client-side from workout_sessions, no new
-- column needed), the user's public plans, and GitHub-style stars (presence
-- only, not a 1-5 rating) on both profiles and plans.

alter table public.profiles add column bio text;

-- Profiles become a fully public directory: any authenticated user can view
-- any profile. Required for the profile page (activity/plans/star button)
-- to work for an arbitrary user, not just a linked coach/client or a public
-- plan's owner -- both of the policies below are now subsumed by this one
-- and are dropped rather than left redundant.
drop policy "profiles_select" on public.profiles;
drop policy "profiles_select_public_plan_owner" on public.profiles;

create policy "profiles_select_all_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Avatar storage: one object per user, path = the user's id with no
-- extension (Storage tracks content-type from the upload itself, so an
-- extension isn't needed for correct serving). Every new upload uses
-- upsert:true against that same fixed path, so it always overwrites the
-- previous image in place -- "only keep 1" falls out of the upload itself,
-- no separate list-then-delete-old step required.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and name = (select auth.uid()::text));

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid()::text))
  with check (bucket_id = 'avatars' and name = (select auth.uid()::text));

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid()::text));

-- Stars: two simple join tables (not one polymorphic table) so each RLS
-- policy stays a one-liner and plan_stars cleans up naturally via the
-- existing plans FK cascade. A row's mere existence is the star -- toggled
-- by inserting/deleting it client-side, never updated.

create table public.profile_stars (
  user_id uuid not null references public.profiles (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id),
  constraint profile_stars_no_self_star check (user_id <> profile_id)
);

create index profile_stars_profile_idx on public.profile_stars (profile_id);

alter table public.profile_stars enable row level security;

create policy "profile_stars_select_all"
  on public.profile_stars for select
  to authenticated
  using (true);

create policy "profile_stars_insert_own"
  on public.profile_stars for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "profile_stars_delete_own"
  on public.profile_stars for delete
  to authenticated
  using (user_id = (select auth.uid()));

create table public.plan_stars (
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, plan_id)
);

create index plan_stars_plan_idx on public.plan_stars (plan_id);

alter table public.plan_stars enable row level security;

create policy "plan_stars_select_all"
  on public.plan_stars for select
  to authenticated
  using (true);

create policy "plan_stars_insert_own"
  on public.plan_stars for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "plan_stars_delete_own"
  on public.plan_stars for delete
  to authenticated
  using (user_id = (select auth.uid()));
