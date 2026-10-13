-- +goose Up
create type swol.session_kind as enum ('workout', 'check_in');

alter table swol.workout_sessions
  add column kind swol.session_kind not null default 'workout',
  add constraint workout_sessions_check_in_is_instant check (
    kind = 'workout'
    or (status = 'completed' and ended_at = started_at and paused_seconds = 0)
  );

alter table swol.workout_sessions drop column legacy_checkin_id;

-- +goose Down
delete from swol.workout_sessions where kind = 'check_in';

alter table swol.workout_sessions
  drop constraint workout_sessions_check_in_is_instant,
  drop column kind,
  add column legacy_checkin_id bigint unique;

drop type swol.session_kind;
