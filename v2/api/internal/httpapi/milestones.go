package httpapi

import (
	"errors"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jamesschuler/swol/v2/api/internal/auth"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

func (s *Server) listMilestones(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	milestones, err := s.queries.ListMilestones(r.Context(), user.ID)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, milestones)
	return nil
}

type milestoneBody struct {
	ExerciseID uuid.UUID     `json:"exerciseId"`
	Weight     float64       `json:"weight"`
	Unit       db.WeightUnit `json:"unit"`
	Reps       int32         `json:"reps"`
	RPE        *float64      `json:"rpe"`
	AchievedAt *time.Time    `json:"achievedAt"`
	Note       string        `json:"note"`
}

func decodeMilestone(r *http.Request) (milestoneBody, error) {
	var body milestoneBody
	if err := decodeJSON(r, &body); err != nil {
		return body, err
	}
	weight, err := validateLift(body.Weight, body.Unit, body.Reps)
	if err != nil {
		return body, err
	}
	body.Weight = weight
	if body.RPE != nil && !isValidRPE(*body.RPE) {
		return body, badRequest("rpe must be 6-10 in steps of 0.5")
	}
	if body.AchievedAt != nil && isInFuture(*body.AchievedAt) {
		return body, badRequest("achievedAt cannot be in the future")
	}
	body.Note = strings.TrimSpace(body.Note)
	if tooLong(body.Note, 500) {
		return body, badRequest("note must be at most 500 characters")
	}
	return body, nil
}

func isValidRPE(rpe float64) bool {
	return rpe >= 6 && rpe <= 10 && rpe*2 == math.Round(rpe*2)
}

func (s *Server) createMilestone(w http.ResponseWriter, r *http.Request) error {
	body, err := decodeMilestone(r)
	if err != nil {
		return err
	}
	achievedAt := time.Now()
	if body.AchievedAt != nil {
		achievedAt = *body.AchievedAt
	}
	user := auth.FromContext(r.Context())
	milestone, err := s.queries.CreateMilestone(r.Context(), db.CreateMilestoneParams{
		UserID:     user.ID,
		ExerciseID: body.ExerciseID,
		Weight:     body.Weight,
		Unit:       body.Unit,
		Reps:       body.Reps,
		RPE:        body.RPE,
		AchievedAt: achievedAt,
		Note:       nilIfEmpty(body.Note),
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return badRequest("unknown exercise")
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusCreated, milestone)
	return nil
}

func (s *Server) updateMilestone(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	body, err := decodeMilestone(r)
	if err != nil {
		return err
	}
	if body.AchievedAt == nil {
		return badRequest("achievedAt is required")
	}
	user := auth.FromContext(r.Context())
	milestone, err := s.queries.UpdateMilestone(r.Context(), db.UpdateMilestoneParams{
		ID:         id,
		UserID:     user.ID,
		ExerciseID: body.ExerciseID,
		Weight:     body.Weight,
		Unit:       body.Unit,
		Reps:       body.Reps,
		RPE:        body.RPE,
		AchievedAt: *body.AchievedAt,
		Note:       nilIfEmpty(body.Note),
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return s.missingMilestoneOrExercise(r, id, user.ID)
	}
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, milestone)
	return nil
}

func (s *Server) missingMilestoneOrExercise(r *http.Request, id, userID uuid.UUID) error {
	_, err := s.queries.GetMilestone(r.Context(), db.GetMilestoneParams{ID: id, UserID: userID})
	if errors.Is(err, pgx.ErrNoRows) {
		return notFound("milestone not found")
	}
	if err != nil {
		return err
	}
	return badRequest("unknown exercise")
}

func (s *Server) deleteMilestone(w http.ResponseWriter, r *http.Request) error {
	id, err := pathID(r, "id")
	if err != nil {
		return err
	}
	user := auth.FromContext(r.Context())
	deleted, err := s.queries.DeleteMilestone(r.Context(), db.DeleteMilestoneParams{ID: id, UserID: user.ID})
	if err != nil {
		return err
	}
	if deleted == 0 {
		return notFound("milestone not found")
	}
	w.WriteHeader(http.StatusNoContent)
	return nil
}
