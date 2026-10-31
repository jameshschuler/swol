-- +goose Up
drop table swol.user_achievements;

-- +goose Down
create table swol.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_code text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_code)
);

alter table swol.user_achievements enable row level security;

create policy "v2 owner read" on swol.user_achievements
  for select to authenticated
  using ((select auth.uid()) = user_id);
