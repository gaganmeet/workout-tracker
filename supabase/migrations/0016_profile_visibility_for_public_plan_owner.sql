-- Bug found while live-verifying 0015: fetchPublicPlans embeds the owning
-- profile so the library can show "by <name>", but profiles_select_linked
-- only covers approved coach/client pairs -- an unrelated library browser
-- got profiles: null back (handled defensively client-side, but the name
-- should actually show). Mirrors the profiles_select_linked pattern (0003)
-- for the public-plan-owner case instead of a coach/client link.

create policy "profiles_select_public_plan_owner"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.plans where plans.owner_id = profiles.id and plans.is_public = true
    )
  );
