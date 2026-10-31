-- +goose Up
insert into swol.exercises (name) values
  ('Power Clean'),
  ('Paused Bench Press');

-- +goose Down
delete from swol.goals
where exercise_id in (
  select id from swol.exercises
  where user_id is null and name in ('Power Clean', 'Paused Bench Press')
);

delete from swol.milestones
where exercise_id in (
  select id from swol.exercises
  where user_id is null and name in ('Power Clean', 'Paused Bench Press')
);

delete from swol.exercises
where user_id is null and name in ('Power Clean', 'Paused Bench Press');
