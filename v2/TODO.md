# Swol v2 TODO

Roughly in order. Each feature already has its tables in `api/migrations/00001_init.sql`; the work is the API, the web page, and tests.

## Features

- [ ] **Milestones.** Log a personal record: exercise, weight, reps, date, in lb or kg. Uses the existing exercises API. Goals and achievements build on this, so it goes first.
- [ ] **Goals.** Set a target such as "Bench 225 × 1". When a new milestone meets a goal, suggest marking it complete and let the user confirm. Never complete it automatically.
- [ ] **Achievements.** Badges earned from activity: first session, a 10-session streak, first goal met. Needs sessions and milestones in place.
- [ ] **Dashboard.** This week's sessions, recent milestones, open goals. Comes last because it pulls from everything above.

## Smaller tasks

- [ ] After the next Render deploy, confirm migrations `00002` and `00003` ran in prod and that v1 check-ins show up in the session history.
- [ ] Write a short overview of each part of the system (web, API, database, Supabase auth, Render) and how they connect.
