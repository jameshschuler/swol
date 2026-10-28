# Swol v2 TODO

Roughly in order. Each feature already has its tables in `api/migrations/00001_init.sql`; the work is the API, the web page, and tests.

## Features

- [ ] **Achievements.** Badges earned from activity: first session, a 10-week streak, first goal met.
- [ ] **Dashboard.** This week's sessions, recent milestones, open goals. Comes last because it pulls from everything above.

## Smaller tasks

- [ ] Set up Google sign-in: create a Google Cloud OAuth client with the Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`), turn on the Google provider in Supabase (dev and prod), and add each site's `/login` (`http://localhost:3000/login` and the prod web URL) to the allowed redirect URLs.
- [ ] Confirm v1 check-ins show up in the session history in prod.
- [ ] Write a short overview of each part of the system (web, API, database, Supabase auth, Render) and how they connect.
