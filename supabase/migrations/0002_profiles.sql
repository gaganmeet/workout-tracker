-- profiles: one row per auth.users row, created via trigger on signup.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  role public.user_role not null,
  avatar_url text,
  weight_unit public.weight_unit not null default 'kg',
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- Populate profiles atomically with signup, reading metadata passed to
-- supabase.auth.signUp({ options: { data: { username, display_name, role } } })
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username'),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'athlete')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: self may always read their own profile. A second, additive SELECT
-- policy allowing a linked coach/client to read each other's profile is
-- added in 0003_coach_client_links.sql once the helper functions exist
-- (Postgres OR's multiple permissive policies for the same command together).
-- Coach discovery for linking happens via the search_coaches() RPC, not by
-- opening this table broadly.

-- auth.uid() is wrapped in a scalar subquery throughout this schema's
-- policies so the planner evaluates it once per query (InitPlan) instead of
-- once per row -- a documented 5-10x difference on larger tables.

create policy "profiles_select_self"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
