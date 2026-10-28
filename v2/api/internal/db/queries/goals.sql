-- name: ListGoals :many
select g.id, g.exercise_id, e.name as exercise_name, g.target_weight, g.unit, g.target_weight_kg,
  g.target_reps, g.completed_at, g.completed_milestone_id, g.created_at
from swol.goals g
join swol.exercises e on e.id = g.exercise_id
where g.user_id = $1
order by g.completed_at is not null, g.completed_at desc, g.created_at desc;

-- name: CreateGoal :one
insert into swol.goals (user_id, exercise_id, target_weight, unit, target_reps)
select
  sqlc.arg(user_id)::uuid,
  e.id,
  sqlc.arg(target_weight)::numeric,
  sqlc.arg(unit)::swol.weight_unit,
  sqlc.arg(target_reps)::int
from swol.exercises e
where e.id = sqlc.arg(exercise_id)
  and (e.user_id is null or e.user_id = sqlc.arg(user_id)::uuid)
returning *;

-- name: CompleteGoal :one
update swol.goals g
set completed_at = now(), completed_milestone_id = sqlc.arg(milestone_id)::uuid, updated_at = now()
where g.id = sqlc.arg(id)
  and g.user_id = sqlc.arg(user_id)
  and g.completed_at is null
  and exists (
    select 1 from swol.milestones m
    where m.id = sqlc.arg(milestone_id)::uuid
      and m.user_id = g.user_id
      and m.exercise_id = g.exercise_id
      and m.weight_kg >= g.target_weight_kg
      and m.reps >= g.target_reps
  )
returning *;

-- name: GetGoal :one
select * from swol.goals
where id = $1 and user_id = $2;

-- name: DeleteGoal :execrows
delete from swol.goals
where id = $1 and user_id = $2;

-- name: UpdateGoal :one
update swol.goals
set target_weight = sqlc.arg(target_weight)::numeric,
  unit = sqlc.arg(unit)::swol.weight_unit,
  target_reps = sqlc.arg(target_reps)::int,
  updated_at = now()
where id = sqlc.arg(id) and user_id = sqlc.arg(user_id) and completed_at is null
returning *;
