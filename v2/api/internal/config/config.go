package config

import (
	"errors"
	"os"
	"strings"
)

type Config struct {
	Port                   string
	DatabaseURL            string
	SupabaseURL            string
	SupabasePublishableKey string
	AllowedOrigins         []string
}

func Load() (Config, error) {
	cfg := Config{
		Port:                   getenv("PORT", "8080"),
		DatabaseURL:            os.Getenv("DATABASE_URL"),
		SupabaseURL:            os.Getenv("SUPABASE_URL"),
		SupabasePublishableKey: os.Getenv("SUPABASE_PUBLISHABLE_KEY"),
		AllowedOrigins:         strings.Split(getenv("ALLOWED_ORIGINS", "http://localhost:3000"), ","),
	}

	var missing []string
	for name, value := range map[string]string{
		"DATABASE_URL":             cfg.DatabaseURL,
		"SUPABASE_URL":             cfg.SupabaseURL,
		"SUPABASE_PUBLISHABLE_KEY": cfg.SupabasePublishableKey,
	} {
		if value == "" {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		return Config{}, errors.New("missing required env: " + strings.Join(missing, ", "))
	}
	return cfg, nil
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
