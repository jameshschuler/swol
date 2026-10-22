-- name: ListMilestones :many
select m.id, m.exercise_id, e.name as exercise_name, m.weight, m.unit, m.weight_kg, m.reps, m.achieved_at, m.note
from swol.milestones m
join swol.exercises e on e.id = m.exercise_id
where m.user_id = $1
order by m.achieved_at desc, m.created_at desc;

-- name: CreateMilestone :one
insert into swol.milestones (user_id, exercise_id, weight, unit, reps, achieved_at, note)
select
  sqlc.arg(user_id)::uuid,
  e.id,
  sqlc.arg(weight)::numeric,
  sqlc.arg(unit)::swol.weight_unit,
  sqlc.arg(reps)::int,
  sqlc.arg(achieved_at)::timestamptz,
  sqlc.narg(note)::text
from swol.exercises e
where e.id = sqlc.arg(exercise_id)
  and (e.user_id is null or e.user_id = sqlc.arg(user_id)::uuid)
returning *;

-- name: DeleteMilestone :execrows
delete from swol.milestones
where id = $1 and user_id = $2;
