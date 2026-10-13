package httpapi

import (
	"net/http"

	"github.com/jamesschuler/swol/v2/api/internal/auth"
)

func (s *Server) listLegacyCheckIns(w http.ResponseWriter, r *http.Request) error {
	user := auth.FromContext(r.Context())
	checkIns, err := s.queries.ListLegacyCheckIns(r.Context(), user.ID)
	if err != nil {
		return err
	}
	writeJSON(w, http.StatusOK, checkIns)
	return nil
}
