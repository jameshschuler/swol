-- name: ListExercises :many
select e.id, e.user_id, e.name, e.created_at, e.base_exercise_id,
  exists (
    select 1 from swol.hidden_exercises h
    where h.exercise_id = e.id and h.user_id = sqlc.arg(user_id)::uuid
  ) as hidden
from swol.exercises e
where e.user_id is null or e.user_id = sqlc.arg(user_id)::uuid
order by lower(e.name);

-- name: CreateExercise :one
insert into swol.exercises (user_id, name, base_exercise_id)
select sqlc.arg(user_id)::uuid, sqlc.arg(name)::text, sqlc.narg(base_exercise_id)::uuid
where sqlc.narg(base_exercise_id)::uuid is null
  or exists (
    select 1 from swol.exercises base
    where base.id = sqlc.narg(base_exercise_id)::uuid
      and (base.user_id is null or base.user_id = sqlc.arg(user_id)::uuid)
      and base.base_exercise_id is null
  )
returning *;

-- name: GetOwnExercise :one
select * from swol.exercises
where id = sqlc.arg(id) and user_id = sqlc.arg(user_id)::uuid;

-- name: UpdateExercise :one
update swol.exercises e
set name = sqlc.arg(name)::text, base_exercise_id = sqlc.narg(base_exercise_id)::uuid
where e.id = sqlc.arg(id)
  and e.user_id = sqlc.arg(user_id)::uuid
  and (
    sqlc.narg(base_exercise_id)::uuid is null
    or (
      exists (
        select 1 from swol.exercises base
        where base.id = sqlc.narg(base_exercise_id)::uuid
          and base.id <> e.id
          and (base.user_id is null or base.user_id = sqlc.arg(user_id)::uuid)
          and base.base_exercise_id is null
      )
      and not exists (
        select 1 from swol.exercises variation
        where variation.base_exercise_id = e.id
      )
    )
  )
returning *;

-- name: DeleteExercise :execrows
delete from swol.exercises
where id = sqlc.arg(id) and user_id = sqlc.arg(user_id)::uuid;

-- name: HideExercise :execrows
insert into swol.hidden_exercises (user_id, exercise_id)
select sqlc.arg(user_id)::uuid, e.id
from swol.exercises e
where e.id = sqlc.arg(exercise_id) and e.user_id is null
on conflict (user_id, exercise_id) do update set exercise_id = excluded.exercise_id;

-- name: UnhideExercise :exec
delete from swol.hidden_exercises
where user_id = sqlc.arg(user_id) and exercise_id = sqlc.arg(exercise_id);
