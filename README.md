# SwoleBalli

A workout tracking PWA for athletes and coaches, built with React + TypeScript + Vite and backed by Supabase (Postgres + Auth + RLS + Storage). Train like a legend.

Live at [swoleballi.gaganmeetbahri.com](https://swoleballi.gaganmeetbahri.com).

## Features

**Plans & workouts**
- Build plans as Plan → Days → Exercises, with drag-and-drop reordering
- Log a workout set-by-set (weight, reps, RPE, warm-up flag) with a built-in rest timer
- Placeholders show your numbers from last time for the same exercise, preferring your most recent session at the *same gym* first (see Gyms below), falling back to your last session anywhere
- Full workout history and per-session detail views
- Duplicate any plan you can see into your own editable copy

**Exercise library**
- Global seeded exercise library plus your own custom exercises
- Muscle group / equipment tagging and optional tutorial video links

**Progress**
- Estimated 1RM and volume charts per exercise
- Filter progress by gym ("All gyms" / "No gym" / a specific gym)

**Gyms**
- Optionally tag a workout session with the gym you trained at (Settings → Gyms to manage your list)
- Keeps "last time" placeholders and progress history honest when the same exercise is loaded differently across locations

**Coaching**
- Athletes can find and link with a coach (request → approve flow)
- Coaches get a client dashboard: pending requests, per-client plans/progress/history, and can assign plans directly to a client
- Coaches can leave notes on a specific exercise (in a plan or a logged session) that are read-only for the athlete; athletes can leave their own private notes too

**Public plan library**
- Publish any plan as public and get a shareable link
- Anyone can browse the public library, view a plan in full, and add their own copy to their account
- Library is sorted by star count, most-starred first

**Profiles & social**
- Every user has a public profile page: optional bio, optional profile picture (auto-compressed and resized client-side before upload), and a GitHub-style heatmap of days worked out
- A profile also lists that user's public plans
- Star (GitHub-style upvote, not a rating) any profile or plan

**Account**
- Change password, set weight unit (kg/lb)
- Delete your account: fully removes your data (plans, workouts, custom exercises, coach links, notes, gyms, stars, avatar file) across every table that references you

**PWA**
- Installable, works offline for previously-loaded data, prompts on update

## Stack

- React 19, TypeScript, Vite
- Tailwind v4 + shadcn/ui (Radix primitives)
- TanStack Query, React Router v7
- react-hook-form + zod
- Recharts, dnd-kit, next-themes (dark mode), sonner (toasts)
- Supabase: Postgres, Auth, Row Level Security, Storage
- vite-plugin-pwa

## Setup

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Supabase

```bash
npm run db:link    # link the CLI to your Supabase project
npm run db:push     # apply supabase/migrations
npm run gen:types    # regenerate src/lib/supabase/database.types.ts after schema changes
```

Global exercise library seed data lives in `supabase/seed.sql` (apply via `supabase db push --include-seed`).

Migrations in `supabase/migrations/` are the source of truth for the schema — every table, RLS policy, and RPC (e.g. `save_plan`, `delete_own_account`, `get_workout_activity`) is defined there in order.

## Scripts

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run lint` — oxlint
- `npm run format` — prettier
