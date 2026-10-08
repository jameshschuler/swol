package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

type Authenticator interface {
	Middleware(http.Handler) http.Handler
}

type Server struct {
	queries db.Querier
}

func NewHandler(queries db.Querier, authenticator Authenticator, allowedOrigins []string) http.Handler {
	s := &Server{queries: queries}

	router := chi.NewRouter()
	router.Use(middleware.RequestID, middleware.Recoverer)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Authorization", "Content-Type"},
		MaxAge:         300,
	}))

	router.Get("/api/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	router.Route("/api/v1", func(r chi.Router) {
		r.Use(authenticator.Middleware)
		r.Get("/me", handle(s.getMe))
		r.Patch("/me", handle(s.updateMe))
		r.Get("/exercises", handle(s.listExercises))
		r.Post("/exercises", handle(s.createExercise))
	})

	return router
}
