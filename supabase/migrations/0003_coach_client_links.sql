-- coach_client_links: manual request/approve link between a coach and a client.

create table public.coach_client_links (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  status public.link_status not null default 'pending',
  requested_by uuid not null references public.profiles (id),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint coach_client_links_distinct check (coach_id <> client_id),
  constraint coach_client_links_unique unique (coach_id, client_id)
);

create index coach_client_links_coach_idx on public.coach_client_links (coach_id);
create index coach_client_links_client_idx on public.coach_client_links (client_id);

alter table public.coach_client_links enable row level security;

-- Helper functions used throughout the schema's RLS policies. Kept in the
-- `private` schema (not exposed via the Data API) since these are never
-- meant to be called directly by client code, only referenced inside policy
-- definitions. SECURITY DEFINER + fixed search_path so they can't be
-- hijacked and always see the full coach_client_links table regardless of
-- the caller's own RLS view of it.

create or replace function private.is_approved_coach_of(p_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.coach_client_links
    where coach_id = (select auth.uid())
      and client_id = p_client_id
      and status = 'approved'
  );
$$;

create or replace function private.is_approved_client_of(p_coach_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.coach_client_links
    where client_id = (select auth.uid())
      and coach_id = p_coach_id
      and status = 'approved'
  );
$$;

revoke all on function private.is_approved_coach_of(uuid) from public;
revoke all on function private.is_approved_client_of(uuid) from public;
grant execute on function private.is_approved_coach_of(uuid) to authenticated;
grant execute on function private.is_approved_client_of(uuid) to authenticated;

-- Additive SELECT policy on profiles: a linked coach/client may read the
-- other party's profile (see profiles_select_self in 0002_profiles.sql).
create policy "profiles_select_linked"
  on public.profiles for select
  to authenticated
  using (
    private.is_approved_coach_of(id)
    or private.is_approved_client_of(id)
  );

-- Coach discovery for the "find a coach" flow: exposes only id/username/
-- display_name for coaches, never the raw profiles table. Lives in public
-- (unlike the helpers above) because it's meant to be called directly via
-- supabase.rpc('search_coaches', ...) from the frontend.
create or replace function public.search_coaches(query text)
returns table (id uuid, username text, display_name text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.username, p.display_name
  from public.profiles p
  where p.role = 'coach'
    and (p.username ilike '%' || query || '%' or p.display_name ilike '%' || query || '%')
  order by p.username
  limit 20;
$$;

revoke all on function public.search_coaches(text) from public;
grant execute on function public.search_coaches(text) to authenticated;

-- RLS: coach_client_links

create policy "links_select_participant"
  on public.coach_client_links for select
  to authenticated
  using (coach_id = (select auth.uid()) or client_id = (select auth.uid()));

create policy "links_insert_by_client"
  on public.coach_client_links for insert
  to authenticated
  with check (
    client_id = (select auth.uid())
    and requested_by = (select auth.uid())
    and status = 'pending'
  );

-- UPDATE is split into two policies so a client can never self-approve their
-- own request: a coach may move status to approved/rejected/revoked, while a
-- client may only downgrade to rejected/revoked (cancel a pending request or
-- walk away from an approved one). A single combined policy with
-- `with check (coach_id = auth.uid() or client_id = auth.uid())` would not
-- enforce this -- it only checks who the row belongs to, not which values
-- they're allowed to set -- so the WITH CHECK must be narrowed per actor.

create policy "links_coach_respond"
  on public.coach_client_links for update
  to authenticated
  using (coach_id = (select auth.uid()))
  with check (coach_id = (select auth.uid()) and status in ('approved', 'rejected', 'revoked'));

create policy "links_client_cancel_or_revoke"
  on public.coach_client_links for update
  to authenticated
  using (client_id = (select auth.uid()))
  with check (client_id = (select auth.uid()) and status in ('rejected', 'revoked'));
