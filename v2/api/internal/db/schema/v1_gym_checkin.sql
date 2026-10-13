-- Read-only v1 table, owned by the v1 app. Declared here only so sqlc can type queries against it.
create table swol.gym_checkin (
  id bigint primary key,
  user_id uuid not null,
  checkin_date timestamptz not null
);
