package db

import (
	"testing"

	"github.com/jackc/pgx/v5"
)

func TestNewPoolAvoidsCachedPreparedStatements(t *testing.T) {
	pool, err := NewPool(t.Context(), "postgres://user:pass@127.0.0.1:1/swol")
	if err != nil {
		t.Fatal(err)
	}
	defer pool.Close()

	if mode := pool.Config().ConnConfig.DefaultQueryExecMode; mode != pgx.QueryExecModeExec {
		t.Fatalf("exec mode = %v, want %v", mode, pgx.QueryExecModeExec)
	}
}

func TestNewPoolRejectsBadURL(t *testing.T) {
	if _, err := NewPool(t.Context(), "not a url ::"); err == nil {
		t.Fatal("expected an error")
	}
}
