package httpapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jamesschuler/swol/v2/api/internal/auth"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

var testUser = auth.User{ID: uuid.MustParse("11111111-1111-4111-8111-111111111111"), Email: "lifter@example.com"}

type fakeAuth struct{ allow bool }

func (f fakeAuth) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !f.allow {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r.WithContext(auth.WithUser(r.Context(), testUser)))
	})
}

type fakeQueries struct {
	db.Querier
	unit            db.WeightUnit
	createExerciseE error
	sessions        []db.WorkoutSession
	legacyCheckIns  []db.ListLegacyCheckInsRow
	exercises       []db.Exercise
	milestones      []db.Milestone
	goals           []db.Goal
}

func (f *fakeQueries) GetOrCreateUserSettings(_ context.Context, userID uuid.UUID) (db.UserSettings, error) {
	return db.UserSettings{UserID: userID, WeightUnit: f.unit}, nil
}

func (f *fakeQueries) UpdateWeightUnit(_ context.Context, arg db.UpdateWeightUnitParams) (db.UserSettings, error) {
	f.unit = arg.WeightUnit
	return db.UserSettings{UserID: arg.UserID, WeightUnit: arg.WeightUnit}, nil
}

func (f *fakeQueries) CreateExercise(_ context.Context, arg db.CreateExerciseParams) (db.Exercise, error) {
	if f.createExerciseE != nil {
		return db.Exercise{}, f.createExerciseE
	}
	if arg.BaseExerciseID != nil && !f.isBaseFor(*arg.BaseExerciseID, arg.UserID) {
		return db.Exercise{}, pgx.ErrNoRows
	}
	return db.Exercise{ID: uuid.New(), UserID: &arg.UserID, Name: arg.Name, BaseExerciseID: arg.BaseExerciseID}, nil
}

func (f *fakeQueries) isBaseFor(id, userID uuid.UUID) bool {
	for _, e := range f.exercises {
		if e.ID == id && (e.UserID == nil || *e.UserID == userID) && e.BaseExerciseID == nil {
			return true
		}
	}
	return false
}

func request(t *testing.T, h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequestWithContext(t.Context(), method, path, strings.NewReader(body))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestHealthIsPublic(t *testing.T) {
	h := NewHandler(&fakeQueries{}, fakeAuth{allow: false}, nil)
	if rec := request(t, h, http.MethodGet, "/api/health", ""); rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	if rec := request(t, h, http.MethodGet, "/api/v1/me", ""); rec.Code != http.StatusUnauthorized {
		t.Fatalf("v1 status = %d", rec.Code)
	}
}

func TestMe(t *testing.T) {
	q := &fakeQueries{unit: db.WeightUnitLb}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	rec := request(t, h, http.MethodGet, "/api/v1/me", "")
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), `"weightUnit":"lb"`) {
		t.Fatalf("get: %d %s", rec.Code, rec.Body)
	}

	if rec := request(t, h, http.MethodPatch, "/api/v1/me", `{"weightUnit":"stone"}`); rec.Code != http.StatusBadRequest {
		t.Fatalf("invalid unit status = %d", rec.Code)
	}

	rec = request(t, h, http.MethodPatch, "/api/v1/me", `{"weightUnit":"kg"}`)
	if rec.Code != http.StatusOK || q.unit != db.WeightUnitKg {
		t.Fatalf("patch: %d %s", rec.Code, rec.Body)
	}
}

func TestCreateExercise(t *testing.T) {
	h := NewHandler(&fakeQueries{}, fakeAuth{allow: true}, nil)
	if rec := request(t, h, http.MethodPost, "/api/v1/exercises", `{"name":"  "}`); rec.Code != http.StatusBadRequest {
		t.Fatalf("blank status = %d", rec.Code)
	}
	if rec := request(t, h, http.MethodPost, "/api/v1/exercises", `{"name":"Zercher Squat"}`); rec.Code != http.StatusCreated {
		t.Fatalf("create status = %d", rec.Code)
	}

	dup := NewHandler(&fakeQueries{createExerciseE: &pgconn.PgError{Code: "23505"}}, fakeAuth{allow: true}, nil)
	if rec := request(t, dup, http.MethodPost, "/api/v1/exercises", `{"name":"Squat"}`); rec.Code != http.StatusConflict {
		t.Fatalf("duplicate status = %d", rec.Code)
	}
}

func TestCreateExerciseVariation(t *testing.T) {
	someoneElse := uuid.New()
	squat := db.Exercise{ID: uuid.New(), Name: "Squat"}
	frontSquat := db.Exercise{ID: uuid.New(), Name: "Front Squat", BaseExerciseID: &squat.ID}
	ownBase := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Hack Squat"}
	private := db.Exercise{ID: uuid.New(), UserID: &someoneElse, Name: "Secret Lift"}
	h := NewHandler(&fakeQueries{exercises: []db.Exercise{squat, frontSquat, ownBase, private}}, fakeAuth{allow: true}, nil)

	body := func(base uuid.UUID) string {
		return `{"name":"Pin Squat","baseExerciseId":"` + base.String() + `"}`
	}
	cases := []struct {
		name, body string
		want       int
	}{
		{"shared base", body(squat.ID), http.StatusCreated},
		{"own base", body(ownBase.ID), http.StatusCreated},
		{"no base", `{"name":"Pin Squat","baseExerciseId":null}`, http.StatusCreated},
		{"base is itself a variation", body(frontSquat.ID), http.StatusBadRequest},
		{"someone else's base", body(private.ID), http.StatusBadRequest},
		{"unknown base", body(uuid.New()), http.StatusBadRequest},
	}
	for _, c := range cases {
		if rec := request(t, h, http.MethodPost, "/api/v1/exercises", c.body); rec.Code != c.want {
			t.Errorf("%s: %d %s", c.name, rec.Code, rec.Body)
		}
	}

	created := decode[db.Exercise](t, request(t, h, http.MethodPost, "/api/v1/exercises", body(squat.ID)).Body.String())
	if created.BaseExerciseID == nil || *created.BaseExerciseID != squat.ID {
		t.Errorf("base = %v, want %v", created.BaseExerciseID, squat.ID)
	}
}
