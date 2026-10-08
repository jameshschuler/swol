package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jamesschuler/swol/v2/api/migrations"
	"github.com/pressly/goose/v3"
	"github.com/pressly/goose/v3/lock"
)

const tableName = "swol.swol_migrations"

func main() {
	if err := run(); err != nil {
		slog.Error("migrate failed", "err", err)
		os.Exit(1)
	}
}

func run() error {
	command := "up"
	if len(os.Args) > 1 {
		command = os.Args[1]
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return errors.New("DATABASE_URL is required")
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return err
	}
	defer db.Close()

	ctx := context.Background()
	if _, err := db.ExecContext(ctx, "create schema if not exists swol"); err != nil {
		return err
	}

	locker, err := lock.NewPostgresSessionLocker()
	if err != nil {
		return err
	}

	provider, err := goose.NewProvider(goose.DialectPostgres, db, migrations.FS,
		goose.WithTableName(tableName),
		goose.WithSessionLocker(locker),
	)
	if err != nil {
		return err
	}

	switch command {
	case "up":
		results, err := provider.Up(ctx)
		for _, r := range results {
			slog.Info("applied", "version", r.Source.Version, "file", r.Source.Path, "duration", r.Duration)
		}
		return err
	case "down":
		result, err := provider.Down(ctx)
		if result != nil {
			slog.Info("rolled back", "version", result.Source.Version, "file", result.Source.Path)
		}
		return err
	case "status":
		statuses, err := provider.Status(ctx)
		for _, s := range statuses {
			fmt.Printf("%-8s %-30s %s\n", s.State, s.Source.Path, s.AppliedAt.Format("2006-01-02 15:04:05"))
		}
		return err
	default:
		return fmt.Errorf("unknown command %q (use up, down or status)", command)
	}
}
