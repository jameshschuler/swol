-- +goose Up
create schema if not exists swol;

create type swol.weight_unit as enum ('lb', 'kg');
create type swol.session_status as enum ('active', 'paused', 'completed');

-- +goose StatementBegin
create function swol.to_kg(weight numeric, unit swol.weight_unit)
returns numeric
language sql
immutable
as $$
  select case unit when 'kg' then weight else round(weight * 0.45359237, 3) end
$$;
-- +goose StatementEnd

create table swol.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weight_unit swol.weight_unit not null default 'lb',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table swol.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create unique index exercises_owner_name_key
  on swol.exercises (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

create table swol.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status swol.session_status not null default 'active',
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  paused_seconds bigint not null default 0 check (paused_seconds >= 0),
  ended_at timestamptz,
  legacy_checkin_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_sessions_status_consistency check (
    (status = 'active' and paused_at is null and ended_at is null)
    or (status = 'paused' and paused_at is not null and ended_at is null)
    or (status = 'completed' and paused_at is null and ended_at is not null)
  ),
  constraint workout_sessions_ended_after_start check (ended_at is null or ended_at >= started_at)
);

create unique index workout_sessions_one_open_per_user
  on swol.workout_sessions (user_id)
  where status <> 'completed';

create index workout_sessions_user_started_idx
  on swol.workout_sessions (user_id, started_at desc);

create table swol.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references swol.workout_sessions (id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index session_notes_session_idx on swol.session_notes (session_id, created_at);

create table swol.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references swol.exercises (id) on delete restrict,
  session_id uuid references swol.workout_sessions (id) on delete set null,
  weight numeric(7, 2) not null check (weight > 0),
  unit swol.weight_unit not null,
  weight_kg numeric(9, 3) generated always as (swol.to_kg(weight, unit)) stored,
  reps int not null check (reps > 0),
  achieved_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

create index milestones_user_exercise_idx
  on swol.milestones (user_id, exercise_id, weight_kg desc);

create table swol.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references swol.exercises (id) on delete restrict,
  target_weight numeric(7, 2) not null check (target_weight > 0),
  unit swol.weight_unit not null,
  target_weight_kg numeric(9, 3) generated always as (swol.to_kg(target_weight, unit)) stored,
  target_reps int not null default 1 check (target_reps > 0),
  completed_at timestamptz,
  completed_milestone_id uuid references swol.milestones (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_open_idx on swol.goals (user_id) where completed_at is null;

create table swol.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_code text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_code)
);

alter table swol.user_settings enable row level security;
alter table swol.exercises enable row level security;
alter table swol.workout_sessions enable row level security;
alter table swol.session_notes enable row level security;
alter table swol.milestones enable row level security;
alter table swol.goals enable row level security;
alter table swol.user_achievements enable row level security;

create policy "v2 owner access" on swol.user_settings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "v2 read shared and own" on swol.exercises
  for select to authenticated
  using (user_id is null or (select auth.uid()) = user_id);

create policy "v2 write own" on swol.exercises
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "v2 owner access" on swol.workout_sessions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "v2 owner access" on swol.session_notes
  for all to authenticated
  using (exists (
    select 1 from swol.workout_sessions s
    where s.id = session_id and s.user_id = (select auth.uid())
  ));

create policy "v2 owner access" on swol.milestones
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "v2 owner access" on swol.goals
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "v2 owner read" on swol.user_achievements
  for select to authenticated
  using ((select auth.uid()) = user_id);

insert into swol.exercises (name) values
  ('Squat'),
  ('Bench Press'),
  ('Deadlift'),
  ('Overhead Press'),
  ('Barbell Row'),
  ('Front Squat'),
  ('Incline Bench Press'),
  ('Romanian Deadlift'),
  ('Pull-up'),
  ('Dip');

-- +goose Down
drop table if exists swol.user_achievements;
drop table if exists swol.goals;
drop table if exists swol.milestones;
drop table if exists swol.session_notes;
drop table if exists swol.workout_sessions;
drop table if exists swol.exercises;
drop table if exists swol.user_settings;
drop function if exists swol.to_kg(numeric, swol.weight_unit);
drop type if exists swol.session_status;
drop type if exists swol.weight_unit;
