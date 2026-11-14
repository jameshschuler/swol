-- +goose Up
alter table swol.exercises
  add column base_exercise_id uuid references swol.exercises (id) on delete set null,
  add constraint exercises_base_not_self check (base_exercise_id <> id);

update swol.exercises variation
set base_exercise_id = base.id
from swol.exercises base
where variation.user_id is null
  and base.user_id is null
  and (variation.name, base.name) in (
    ('Paused Bench Press', 'Bench Press'),
    ('Incline Bench Press', 'Bench Press'),
    ('Front Squat', 'Squat'),
    ('Romanian Deadlift', 'Deadlift')
  );

-- +goose Down
alter table swol.exercises drop column base_exercise_id;
