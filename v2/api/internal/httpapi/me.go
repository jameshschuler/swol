package httpapi

import (
	"net/http"

	"github.com/jamesschuler/swol/v2/api/internal/auth"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

type meResponse struct {
	ID         string        `json:"id"`
	Email      string        `json:"email"`
	WeightUnit db.WeightUnit `json:"weightUnit"`
}

func (s *Server) getMe(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	settings, err := s.queries.GetOrCreateUserSettings(r.Context(), user.ID)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, meResponse{ID: user.ID.String(), Email: user.Email, WeightUnit: settings.WeightUnit})
	return nil
}

func (s *Server) updateMe(w http.ResponseWriter, r *http.Request) error {
	var body struct {
		WeightUnit db.WeightUnit `json:"weightUnit"`
	}
	if err := decodeJSON(r, &body); err != nil {
		return err
	}
	if body.WeightUnit != db.WeightUnitLb && body.WeightUnit != db.WeightUnitKg {
		return badRequest("weightUnit must be lb or kg")
	}

	user := auth.FromContext(r.Context())
	settings, err := s.queries.UpdateWeightUnit(r.Context(), db.UpdateWeightUnitParams{UserID: user.ID, WeightUnit: body.WeightUnit})
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, meResponse{ID: user.ID.String(), Email: user.Email, WeightUnit: settings.WeightUnit})
	return nil
}
