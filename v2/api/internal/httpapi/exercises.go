package httpapi

import (
	"errors"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jamesschuler/swol/v2/api/internal/auth"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

func (s *Server) listExercises(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	exercises, err := s.queries.ListExercises(r.Context(), &user.ID)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, exercises)
	return nil
}

func (s *Server) createExercise(w http.ResponseWriter, r *http.Request) error {
	var body struct {
		Name string `json:"name"`
	}
	if err := decodeJSON(r, &body); err != nil {
		return err
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > 100 {
		return badRequest("name must be 1-100 characters")
	}

	user := auth.FromContext(r.Context())
	exercise, err := s.queries.CreateExercise(r.Context(), db.CreateExerciseParams{UserID: &user.ID, Name: name})
	if isUniqueViolation(err) {
		return conflict("exercise already exists")
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusCreated, exercise)
	return nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
