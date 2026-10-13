-- +goose Up
alter table swol.workout_sessions add column notes text;

drop table swol.session_notes;

-- +goose Down
create table swol.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references swol.workout_sessions (id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index session_notes_session_idx on swol.session_notes (session_id, created_at);

alter table swol.session_notes enable row level security;

create policy "v2 owner access" on swol.session_notes
  for all to authenticated
  using (exists (
    select 1 from swol.workout_sessions s
    where s.id = session_id and s.user_id = (select auth.uid())
  ));

alter table swol.workout_sessions drop column notes;
