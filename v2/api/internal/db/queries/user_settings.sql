-- name: GetOrCreateUserSettings :one
insert into swol.user_settings (user_id)
values ($1)
on conflict (user_id) do update set user_id = excluded.user_id
returning *;

-- name: UpdateWeightUnit :one
insert into swol.user_settings (user_id, weight_unit)
values ($1, $2)
on conflict (user_id) do update set weight_unit = excluded.weight_unit, updated_at = now()
returning *;
