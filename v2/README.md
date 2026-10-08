# Swol v2

Go API + TanStack Start SPA on Supabase. v1 lives in `../swol` and keeps running on the same Supabase project and `swol` schema.

## Layout

- `api/` — Go (chi, pgx, sqlc). Auth tokens are validated by Supabase via `auth-go`.
- `web/` — TanStack Start (SPA mode), TanStack Query, neobrutalism components, Lucide.
- `supabase/` — Supabase CLI config and migrations for v2 tables.
- `../render.yaml` — Render blueprint (Go web service + static site).

## Setup

```sh
cp api/.env.example api/.env   # DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
cp web/.env.example web/.env   # VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_API_URL
npm install && npm --prefix web install
npm run dev                    # api :8080, web :3000
```

## Database

v2 tables share the `swol` schema with v1 and avoid v1 names (`activity`, `gym_checkin`, `user_profile`, `programs`). v1's drizzle config uses `tablesFilter` so `drizzle-kit` never touches v2 tables.

Migrations live in `api/migrations` and run with [goose](https://github.com/pressly/goose), tracked in `swol.swol_migrations`. Do not use `supabase db push` or `supabase migration repair`: the Supabase project's shared `supabase_migrations` history belongs to other apps.

```sh
npm run migrate                # apply pending migrations (uses api/.env DATABASE_URL)
npm run migrate -- status
npm run migrate -- down        # roll back the latest migration
npm run generate               # regenerate sqlc code after schema/query changes
```

Render runs `migrate up` before starting the API on each deploy.
