-- name: ListExercises :many
select * from swol.exercises
where user_id is null or user_id = $1
order by lower(name);

-- name: CreateExercise :one
insert into swol.exercises (user_id, name)
values ($1, $2)
returning *;
