package httpapi

import (
	"errors"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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

type exerciseBody struct {
	Name           string     `json:"name"`
	BaseExerciseID *uuid.UUID `json:"baseExerciseId"`
}

func decodeExercise(r *http.Request) (exerciseBody, error) {
	var body exerciseBody
	if err := decodeJSON(r, &body); err != nil {
		return body, err
	}
	body.Name = strings.TrimSpace(body.Name)
	if body.Name == "" || tooLong(body.Name, 100) {
		return body, badRequest("name must be 1-100 characters")
	}
	return body, nil
}

func (s *Server) createExercise(w http.ResponseWriter, r *http.Request) error {
	body, err := decodeExercise(r)
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	exercise, err := s.queries.CreateExercise(r.Context(), db.CreateExerciseParams{UserID: user.ID, Name: body.Name, BaseExerciseID: body.BaseExerciseID})
	if isUniqueViolation(err) {
		return conflict("exercise already exists")
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return badRequest("unknown base exercise")
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusCreated, exercise)
	return nil
}

func (s *Server) updateExercise(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	body, err := decodeExercise(r)
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	exercise, err := s.queries.UpdateExercise(r.Context(), db.UpdateExerciseParams{ID: id, UserID: user.ID, Name: body.Name, BaseExerciseID: body.BaseExerciseID})
	if isUniqueViolation(err) {
		return conflict("exercise already exists")
	}
	if errors.Is(err, pgx.ErrNoRows) {
		return s.missingExerciseOrBase(r, id, user.ID)
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, exercise)
	return nil
}

func (s *Server) missingExerciseOrBase(r *http.Request, id, userID uuid.UUID) error {
	_, err := s.queries.GetOwnExercise(r.Context(), db.GetOwnExerciseParams{ID: id, UserID: userID})
	if errors.Is(err, pgx.ErrNoRows) {
		return notFound("exercise not found")
	}
	if err != nil {
		return err
	}
	return badRequest("invalid base exercise")
}

func (s *Server) deleteExercise(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	deleted, err := s.queries.DeleteExercise(r.Context(), db.DeleteExerciseParams{ID: id, UserID: user.ID})
	if isForeignKeyViolation(err) {
		return conflict("exercise is used by milestones or goals")
	}
	if err != nil {
		return err
	}
	if deleted == 0 {
		return notFound("exercise not found")
	}
	w.WriteHeader(http.StatusNoContent)
	return nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func isForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23503"
}
