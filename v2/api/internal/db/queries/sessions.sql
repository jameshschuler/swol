-- name: StartSession :one
insert into swol.workout_sessions (user_id)
values ($1)
returning *;

-- name: GetOpenSession :one
select * from swol.workout_sessions
where user_id = $1 and status <> 'completed';

-- name: GetSession :one
select * from swol.workout_sessions
where id = $1 and user_id = $2;

-- name: ListSessions :many
select * from swol.workout_sessions
where user_id = $1
order by started_at desc;

-- name: PauseSession :one
update swol.workout_sessions
set status = 'paused', paused_at = now(), updated_at = now()
where id = $1 and user_id = $2 and status = 'active'
returning *;

-- name: ResumeSession :one
update swol.workout_sessions
set status = 'active',
  paused_seconds = paused_seconds + extract(epoch from now() - paused_at)::bigint,
  paused_at = null,
  updated_at = now()
where id = $1 and user_id = $2 and status = 'paused'
returning *;

-- name: EndSession :one
update swol.workout_sessions
set status = 'completed',
  paused_seconds = paused_seconds + coalesce(extract(epoch from now() - paused_at)::bigint, 0),
  paused_at = null,
  ended_at = now(),
  updated_at = now()
where id = $1 and user_id = $2 and status <> 'completed'
returning *;

-- name: DeleteSession :execrows
delete from swol.workout_sessions
where id = $1 and user_id = $2;

-- name: UpdateSessionNotes :one
update swol.workout_sessions
set notes = $3, updated_at = now()
where id = $1 and user_id = $2
returning *;

-- name: CheckIn :one
insert into swol.workout_sessions (user_id, kind, status, started_at, ended_at)
values (sqlc.arg(user_id), 'check_in', 'completed', sqlc.arg(checked_in_at), sqlc.arg(checked_in_at))
returning *;
