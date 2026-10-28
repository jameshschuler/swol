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
		r.Get("/legacy-check-ins", handle(s.listLegacyCheckIns))
		r.Get("/milestones", handle(s.listMilestones))
		r.Post("/milestones", handle(s.createMilestone))
		r.Delete("/milestones/{id}", handle(s.deleteMilestone))
		r.Get("/goals", handle(s.listGoals))
		r.Post("/goals", handle(s.createGoal))
		r.Patch("/goals/{id}", handle(s.updateGoal))
		r.Post("/goals/{id}/complete", handle(s.completeGoal))
		r.Post("/goals/{id}/reopen", handle(s.reopenGoal))
		r.Delete("/goals/{id}", handle(s.deleteGoal))
		r.Route("/sessions", func(r chi.Router) {
			r.Get("/", handle(s.listSessions))
			r.Post("/", handle(s.startSession))
			r.Post("/check-in", handle(s.checkIn))
			r.Get("/current", handle(s.getOpenSession))
			r.Get("/{id}", handle(s.getSession))
			r.Patch("/{id}", handle(s.updateSessionNotes))
			r.Delete("/{id}", handle(s.deleteSession))
			r.Post("/{id}/pause", handle(s.pauseSession))
			r.Post("/{id}/resume", handle(s.resumeSession))
			r.Post("/{id}/end", handle(s.endSession))
		})
	})

	return router
}
