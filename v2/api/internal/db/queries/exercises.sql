-- name: ListExercises :many
select * from swol.exercises
where user_id is null or user_id = $1
order by lower(name);

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
