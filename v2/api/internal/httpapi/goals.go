package httpapi

import (
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jamesschuler/swol/v2/api/internal/auth"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

var errGoalNotFound = notFound("goal not found")

func (s *Server) listGoals(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	goals, err := s.queries.ListGoals(r.Context(), user.ID)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, goals)
	return nil
}

func (s *Server) createGoal(w http.ResponseWriter, r *http.Request) error {
	var body struct {
		ExerciseID   uuid.UUID     `json:"exerciseId"`
		TargetWeight float64       `json:"targetWeight"`
		Unit         db.WeightUnit `json:"unit"`
		TargetReps   int32         `json:"targetReps"`
	}
	if err := decodeJSON(r, &body); err != nil {
		return err
	}
	weight, err := validateLift(body.TargetWeight, body.Unit, body.TargetReps)
	if err != nil {
		return err
	}

	user := auth.FromContext(r.Context())
	goal, err := s.queries.CreateGoal(r.Context(), db.CreateGoalParams{
		UserID:       user.ID,
		ExerciseID:   body.ExerciseID,
		TargetWeight: weight,
		Unit:         body.Unit,
		TargetReps:   body.TargetReps,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return badRequest("unknown exercise")
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusCreated, goal)
	return nil
}

func (s *Server) updateGoal(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	var body struct {
		TargetWeight float64       `json:"targetWeight"`
		Unit         db.WeightUnit `json:"unit"`
		TargetReps   int32         `json:"targetReps"`
	}
	if err := decodeJSON(r, &body); err != nil {
		return err
	}
	weight, err := validateLift(body.TargetWeight, body.Unit, body.TargetReps)
	if err != nil {
		return err
	}

	user := auth.FromContext(r.Context())
	goal, err := s.queries.UpdateGoal(r.Context(), db.UpdateGoalParams{ID: id, UserID: user.ID, TargetWeight: weight, Unit: body.Unit, TargetReps: body.TargetReps})
	if errors.Is(err, pgx.ErrNoRows) {
		if _, err := s.findGoal(r, id, user.ID); err != nil {
			return err
		}
		return conflict("a completed goal can't be edited")
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, goal)
	return nil
}

func (s *Server) completeGoal(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	var body struct {
		MilestoneID *uuid.UUID `json:"milestoneId"`
	}
	if err := decodeJSON(r, &body); err != nil {
		return err
	}

	user := auth.FromContext(r.Context())
	goal, err := s.queries.CompleteGoal(r.Context(), db.CompleteGoalParams{ID: id, UserID: user.ID, MilestoneID: body.MilestoneID})
	if errors.Is(err, pgx.ErrNoRows) {
		existing, err := s.findGoal(r, id, user.ID)
		if err != nil {
			return err
		}
		if existing.CompletedAt != nil {
			return conflict("goal is already complete")
		}
		return conflict("that milestone doesn't meet this goal")
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, goal)
	return nil
}

func (s *Server) reopenGoal(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	goal, err := s.queries.ReopenGoal(r.Context(), db.ReopenGoalParams{ID: id, UserID: user.ID})
	if errors.Is(err, pgx.ErrNoRows) {
		if _, err := s.findGoal(r, id, user.ID); err != nil {
			return err
		}
		return conflict("goal isn't complete")
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, goal)
	return nil
}

func (s *Server) deleteGoal(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	deleted, err := s.queries.DeleteGoal(r.Context(), db.DeleteGoalParams{ID: id, UserID: user.ID})
	if err != nil {
		return err
	}
	if deleted == 0 {
		return errGoalNotFound
	}
	w.WriteHeader(http.StatusNoContent)
	return nil
}

func (s *Server) findGoal(r *http.Request, id, userID uuid.UUID) (db.Goal, error) {
	goal, err := s.queries.GetGoal(r.Context(), db.GetGoalParams{ID: id, UserID: userID})
	if errors.Is(err, pgx.ErrNoRows) {
		return db.Goal{}, errGoalNotFound
	}
	return goal, err
}
