package httpapi

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jamesschuler/swol/v2/api/internal/auth"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

var errSessionNotFound = notFound("session not found")

type sessionTransition func(ctx context.Context, id, userID uuid.UUID) (db.WorkoutSession, error)

func (s *Server) listSessions(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	sessions, err := s.queries.ListSessions(r.Context(), user.ID)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, sessions)
	return nil
}

func (s *Server) startSession(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	session, err := s.queries.StartSession(r.Context(), user.ID)
	if isUniqueViolation(err) {
		return conflict("a session is already in progress")
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusCreated, session)
	return nil
}

func (s *Server) checkIn(w http.ResponseWriter, r *http.Request) error {
	var body struct {
		CheckedInAt *time.Time `json:"checkedInAt"`
	}
	if err := decodeJSON(r, &body); err != nil {
		return err
	}
	checkedInAt := time.Now()
	if body.CheckedInAt != nil {
		checkedInAt = *body.CheckedInAt
	}
	if checkedInAt.After(time.Now()) {
		return badRequest("checkedInAt cannot be in the future")
	}

	user := auth.FromContext(r.Context())
	session, err := s.queries.CheckIn(r.Context(), db.CheckInParams{UserID: user.ID, CheckedInAt: checkedInAt})
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusCreated, session)
	return nil
}

func (s *Server) getOpenSession(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	session, err := s.queries.GetOpenSession(r.Context(), user.ID)
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusOK, nil)
		return nil
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, session)
	return nil
}

func (s *Server) getSession(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	session, err := s.queries.GetSession(r.Context(), db.GetSessionParams{ID: id, UserID: user.ID})
	if errors.Is(err, pgx.ErrNoRows) {
		return errSessionNotFound
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, session)
	return nil
}

func (s *Server) deleteSession(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	deleted, err := s.queries.DeleteSession(r.Context(), db.DeleteSessionParams{ID: id, UserID: user.ID})
	if err != nil {
		return err
	}
	if deleted == 0 {
		return errSessionNotFound
	}
	w.WriteHeader(http.StatusNoContent)
	return nil
}

func (s *Server) pauseSession(w http.ResponseWriter, r *http.Request) error {
	return s.transitionSession(w, r, "only an active session can be paused", func(ctx context.Context, id, userID uuid.UUID) (db.WorkoutSession, error) {
		return s.queries.PauseSession(ctx, db.PauseSessionParams{ID: id, UserID: userID})
	})
}

func (s *Server) resumeSession(w http.ResponseWriter, r *http.Request) error {
	return s.transitionSession(w, r, "only a paused session can be resumed", func(ctx context.Context, id, userID uuid.UUID) (db.WorkoutSession, error) {
		return s.queries.ResumeSession(ctx, db.ResumeSessionParams{ID: id, UserID: userID})
	})
}

func (s *Server) endSession(w http.ResponseWriter, r *http.Request) error {
	return s.transitionSession(w, r, "session has already ended", func(ctx context.Context, id, userID uuid.UUID) (db.WorkoutSession, error) {
		return s.queries.EndSession(ctx, db.EndSessionParams{ID: id, UserID: userID})
	})
}

func (s *Server) transitionSession(w http.ResponseWriter, r *http.Request, conflictMessage string, transition sessionTransition) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	session, err := transition(r.Context(), id, user.ID)
	if errors.Is(err, pgx.ErrNoRows) {
		_, err = s.queries.GetSession(r.Context(), db.GetSessionParams{ID: id, UserID: user.ID})
		if errors.Is(err, pgx.ErrNoRows) {
			return errSessionNotFound
		}
		if err != nil {
			return err
		}
		return conflict(conflictMessage)
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, session)
	return nil
}

func (s *Server) updateSessionNotes(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	var body struct {
		Notes string `json:"notes"`
	}
	if err := decodeJSON(r, &body); err != nil {
		return err
	}
	text := strings.TrimSpace(body.Notes)
	if len(text) > 5000 {
		return badRequest("notes must be at most 5000 characters")
	}
	var notes *string
	if text != "" {
		notes = &text
	}

	user := auth.FromContext(r.Context())
	session, err := s.queries.UpdateSessionNotes(r.Context(), db.UpdateSessionNotesParams{ID: id, UserID: user.ID, Notes: notes})
	if errors.Is(err, pgx.ErrNoRows) {
		return errSessionNotFound
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, session)
	return nil
}

func pathID(r *http.Request, key string) (uuid.UUID, error) {
	id, err := uuid.Parse(chi.URLParam(r, key))
	if err != nil {
		return uuid.Nil, notFound("not found")
	}
	return id, nil
}
