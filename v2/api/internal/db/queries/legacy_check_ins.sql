-- name: ListLegacyCheckIns :many
select id, checkin_date as checked_in_at
from swol.gym_checkin
where user_id = $1
order by checkin_date desc;
