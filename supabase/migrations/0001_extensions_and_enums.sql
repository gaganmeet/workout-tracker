-- Extensions
create extension if not exists pgcrypto;

-- Private schema for internal RLS helper functions: not exposed via the
-- PostgREST Data API (only `public` is exposed by default), so these are
-- reachable only from inside policy definitions, never as a client RPC call.
create schema if not exists private;
grant usage on schema private to authenticated;

-- Enums
create type public.user_role as enum ('athlete', 'coach');
create type public.link_status as enum ('pending', 'approved', 'rejected', 'revoked');
create type public.weight_unit as enum ('kg', 'lb');
create type public.muscle_group as enum (
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings',
  'glutes', 'calves', 'core', 'forearms', 'full_body', 'cardio', 'other'
);
create type public.equipment_type as enum (
  'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'band', 'other'
);
