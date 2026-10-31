# Swol v2 TODO

## Smaller tasks

- [ ] Set up Google sign-in: create a Google Cloud OAuth client with the Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`), turn on the Google provider in Supabase (dev and prod), and add each site's `/login` (`http://localhost:3000/login` and the prod web URL) to the allowed redirect URLs.
- [ ] Confirm v1 check-ins show up in the session history in prod.
- [ ] Write a short overview of each part of the system (web, API, database, Supabase auth, Render) and how they connect.
