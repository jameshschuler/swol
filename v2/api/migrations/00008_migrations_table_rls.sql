-- +goose Up
alter table swol.swol_migrations enable row level security;
revoke all on swol.swol_migrations from anon, authenticated;

-- +goose Down
