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

const maxWeight = 99999.99

func (s *Server) listMilestones(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	milestones, err := s.queries.ListMilestones(r.Context(), user.ID)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, milestones)
	return nil
}

func (s *Server) createMilestone(w http.ResponseWriter, r *http.Request) error {
	var body struct {
		ExerciseID uuid.UUID     `json:"exerciseId"`
		Weight     float64       `json:"weight"`
		Unit       db.WeightUnit `json:"unit"`
		Reps       int32         `json:"reps"`
		AchievedAt *time.Time    `json:"achievedAt"`
		Note       string        `json:"note"`
	}
	if err := decodeJSON(r, &body); err != nil {
		return err
	}
	weight := math.Round(body.Weight*100) / 100
	if weight <= 0 || weight > maxWeight {
		return badRequest("weight must be between 0 and 99999.99")
	}
	if body.Unit != db.WeightUnitLb && body.Unit != db.WeightUnitKg {
		return badRequest("unit must be lb or kg")
	}
	if body.Reps < 1 || body.Reps > 1000 {
		return badRequest("reps must be 1-1000")
	}
	achievedAt := time.Now()
	if body.AchievedAt != nil {
		achievedAt = *body.AchievedAt
	}
	if isInFuture(achievedAt) {
		return badRequest("achievedAt cannot be in the future")
	}
	note := strings.TrimSpace(body.Note)
	if tooLong(note, 500) {
		return badRequest("note must be at most 500 characters")
	}

	user := auth.FromContext(r.Context())
	milestone, err := s.queries.CreateMilestone(r.Context(), db.CreateMilestoneParams{
		UserID:     user.ID,
		ExerciseID: body.ExerciseID,
		Weight:     weight,
		Unit:       body.Unit,
		Reps:       body.Reps,
		AchievedAt: achievedAt,
		Note:       nilIfEmpty(note),
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
