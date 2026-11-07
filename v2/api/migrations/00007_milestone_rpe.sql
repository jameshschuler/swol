-- +goose Up
alter table swol.milestones
  add column rpe numeric(3, 1) check (rpe between 6 and 10 and rpe * 2 = round(rpe * 2));

-- +goose Down
alter table swol.milestones drop column rpe;
