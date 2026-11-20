-- +goose Up
create table swol.hidden_exercises (
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references swol.exercises (id) on delete cascade,
  primary key (user_id, exercise_id)
);

alter table swol.hidden_exercises enable row level security;

create policy "v2 owner access" on swol.hidden_exercises
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- +goose Down
drop table if exists swol.hidden_exercises;
