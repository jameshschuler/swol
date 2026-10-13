package httpapi

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

func (f *fakeQueries) ListLegacyCheckIns(_ context.Context, userID uuid.UUID) ([]db.ListLegacyCheckInsRow, error) {
	if userID != testUser.ID {
		return []db.ListLegacyCheckInsRow{}, nil
	}
	return f.legacyCheckIns, nil
}

func TestListLegacyCheckIns(t *testing.T) {
	checkedInAt := time.Date(2025, 3, 1, 8, 0, 0, 0, time.UTC)
	q := &fakeQueries{legacyCheckIns: []db.ListLegacyCheckInsRow{{ID: 7, CheckedInAt: checkedInAt}}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	rec := request(t, h, http.MethodGet, "/api/v1/legacy-check-ins", "")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	got := decode[[]db.ListLegacyCheckInsRow](t, rec.Body.String())
	if len(got) != 1 || got[0].ID != 7 || !got[0].CheckedInAt.Equal(checkedInAt) {
		t.Fatalf("got %+v", got)
	}

	for _, method := range []string{http.MethodPost, http.MethodPatch, http.MethodDelete} {
		if rec := request(t, h, method, "/api/v1/legacy-check-ins", "{}"); rec.Code != http.StatusMethodNotAllowed {
			t.Errorf("%s status = %d, want read-only", method, rec.Code)
		}
	}
}
