# Workout Tracker

React + TypeScript + Vite PWA for athletes and coaches, backed by Supabase.

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

## Scripts

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run lint` — oxlint
- `npm run format` — prettier
