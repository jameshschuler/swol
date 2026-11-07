-- name: ListMilestones :many
select m.id, m.exercise_id, e.name as exercise_name, m.weight, m.unit, m.weight_kg, m.reps, m.rpe, m.achieved_at, m.note
from swol.milestones m
join swol.exercises e on e.id = m.exercise_id
where m.user_id = $1
order by m.achieved_at desc, m.created_at desc;

-- name: GetMilestone :one
select * from swol.milestones
where id = $1 and user_id = $2;

-- name: CreateMilestone :one
insert into swol.milestones (user_id, exercise_id, weight, unit, reps, rpe, achieved_at, note)
select
  sqlc.arg(user_id)::uuid,
  e.id,
  sqlc.arg(weight)::numeric,
  sqlc.arg(unit)::swol.weight_unit,
  sqlc.arg(reps)::int,
  sqlc.narg(rpe)::numeric,
  sqlc.arg(achieved_at)::timestamptz,
  sqlc.narg(note)::text
from swol.exercises e
where e.id = sqlc.arg(exercise_id)
  and (e.user_id is null or e.user_id = sqlc.arg(user_id)::uuid)
returning *;

-- name: UpdateMilestone :one
with exercise as (
  select e.id from swol.exercises e
  where e.id = sqlc.arg(exercise_id)
    and (e.user_id is null or e.user_id = sqlc.arg(user_id)::uuid)
), unlinked as (
  update swol.goals g
  set completed_milestone_id = null, updated_at = now()
  from exercise
  where g.completed_milestone_id = sqlc.arg(id)
    and g.user_id = sqlc.arg(user_id)::uuid
    and (
      g.exercise_id <> exercise.id
      or swol.to_kg(sqlc.arg(weight)::numeric, sqlc.arg(unit)::swol.weight_unit) < g.target_weight_kg
      or sqlc.arg(reps)::int < g.target_reps
    )
)
update swol.milestones m
set exercise_id = exercise.id,
  weight = sqlc.arg(weight)::numeric,
  unit = sqlc.arg(unit)::swol.weight_unit,
  reps = sqlc.arg(reps)::int,
  rpe = sqlc.narg(rpe)::numeric,
  achieved_at = sqlc.arg(achieved_at)::timestamptz,
  note = sqlc.narg(note)::text
from exercise
where m.id = sqlc.arg(id)
  and m.user_id = sqlc.arg(user_id)::uuid
returning m.*;

-- name: DeleteMilestone :execrows
delete from swol.milestones
where id = $1 and user_id = $2;
