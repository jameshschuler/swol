package db

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Transaction poolers such as Supabase's port 6543 hand each query to any backend
// connection, so named prepared statements cached per connection break.
func NewPool(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeExec
	return pgxpool.NewWithConfig(ctx, config)
}
