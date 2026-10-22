package httpapi

import (
	"context"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

func (f *fakeQueries) CreateMilestone(_ context.Context, arg db.CreateMilestoneParams) (db.Milestone, error) {
	for _, exercise := range f.exercises {
		if exercise.ID == arg.ExerciseID && (exercise.UserID == nil || *exercise.UserID == arg.UserID) {
			milestone := db.Milestone{ID: uuid.New(), UserID: arg.UserID, ExerciseID: arg.ExerciseID, Weight: arg.Weight, Unit: arg.Unit, Reps: arg.Reps, AchievedAt: arg.AchievedAt, Note: arg.Note}
			f.milestones = append(f.milestones, milestone)
			return milestone, nil
		}
	}
	return db.Milestone{}, pgx.ErrNoRows
}

func (f *fakeQueries) ListMilestones(_ context.Context, userID uuid.UUID) ([]db.ListMilestonesRow, error) {
	rows := []db.ListMilestonesRow{}
	for _, m := range f.milestones {
		if m.UserID == userID {
			rows = append(rows, db.ListMilestonesRow{ID: m.ID, ExerciseID: m.ExerciseID, Weight: m.Weight, Unit: m.Unit, Reps: m.Reps, AchievedAt: m.AchievedAt, Note: m.Note})
		}
	}
	return rows, nil
}

func (f *fakeQueries) DeleteMilestone(_ context.Context, arg db.DeleteMilestoneParams) (int64, error) {
	for i, m := range f.milestones {
		if m.ID == arg.ID && m.UserID == arg.UserID {
			f.milestones = append(f.milestones[:i], f.milestones[i+1:]...)
			return 1, nil
		}
	}
	return 0, nil
}

func TestCreateMilestone(t *testing.T) {
	someoneElse := uuid.New()
	shared := db.Exercise{ID: uuid.New(), Name: "Squat"}
	own := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Zercher Squat"}
	private := db.Exercise{ID: uuid.New(), UserID: &someoneElse, Name: "Secret Lift"}
	q := &fakeQueries{exercises: []db.Exercise{shared, own, private}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	body := func(exercise uuid.UUID, extra string) string {
		return `{"exerciseId":"` + exercise.String() + `","weight":225,"unit":"lb","reps":1` + extra + `}`
	}
	future := time.Now().Add(time.Hour).Format(time.RFC3339)

	cases := []struct {
		name, body string
		want       int
	}{
		{"shared exercise", body(shared.ID, ""), http.StatusCreated},
		{"own exercise with note and date", body(own.ID, `,"note":"  belt  ","achievedAt":"2026-09-01T12:00:00Z"`), http.StatusCreated},
		{"someone else's exercise", body(private.ID, ""), http.StatusBadRequest},
		{"unknown exercise", body(uuid.New(), ""), http.StatusBadRequest},
		{"zero weight", `{"exerciseId":"` + shared.ID.String() + `","weight":0,"unit":"lb","reps":1}`, http.StatusBadRequest},
		{"too heavy", `{"exerciseId":"` + shared.ID.String() + `","weight":100000,"unit":"lb","reps":1}`, http.StatusBadRequest},
		{"bad unit", `{"exerciseId":"` + shared.ID.String() + `","weight":100,"unit":"stone","reps":1}`, http.StatusBadRequest},
		{"zero reps", `{"exerciseId":"` + shared.ID.String() + `","weight":100,"unit":"kg","reps":0}`, http.StatusBadRequest},
		{"future", body(shared.ID, `,"achievedAt":"`+future+`"`), http.StatusBadRequest},
		{"long note", body(shared.ID, `,"note":"`+strings.Repeat("a", 501)+`"`), http.StatusBadRequest},
		{"rounds to zero", `{"exerciseId":"` + shared.ID.String() + `","weight":0.004,"unit":"lb","reps":1}`, http.StatusBadRequest},
		{"rounds over the max", `{"exerciseId":"` + shared.ID.String() + `","weight":99999.995,"unit":"lb","reps":1}`, http.StatusBadRequest},
	}
	for _, c := range cases {
		if rec := request(t, h, http.MethodPost, "/api/v1/milestones", c.body); rec.Code != c.want {
			t.Errorf("%s: %d %s", c.name, rec.Code, rec.Body)
		}
	}

	if len(q.milestones) != 2 {
		t.Fatalf("saved %d milestones, want 2", len(q.milestones))
	}

	slightlyAhead := time.Now().Add(time.Minute).Format(time.RFC3339)
	if rec := request(t, h, http.MethodPost, "/api/v1/milestones", body(shared.ID, `,"achievedAt":"`+slightlyAhead+`"`)); rec.Code != http.StatusCreated {
		t.Errorf("client clock a minute ahead: %d %s", rec.Code, rec.Body)
	}
	if rec := request(t, h, http.MethodPost, "/api/v1/milestones", body(shared.ID, `,"note":"`+strings.Repeat("💪", 500)+`"`)); rec.Code != http.StatusCreated {
		t.Errorf("500 emoji note: %d %s", rec.Code, rec.Body)
	}
	if note := q.milestones[1].Note; note == nil || *note != "belt" {
		t.Errorf("note = %v, want trimmed", note)
	}
	if q.milestones[0].Note != nil {
		t.Errorf("empty note should be nil")
	}
}

func TestListAndDeleteMilestones(t *testing.T) {
	mine := db.Milestone{ID: uuid.New(), UserID: testUser.ID, Weight: 100, Unit: db.WeightUnitKg, Reps: 3}
	theirs := db.Milestone{ID: uuid.New(), UserID: uuid.New(), Weight: 50, Unit: db.WeightUnitKg, Reps: 1}
	q := &fakeQueries{milestones: []db.Milestone{mine, theirs}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	rows := decode[[]db.ListMilestonesRow](t, request(t, h, http.MethodGet, "/api/v1/milestones", "").Body.String())
	if len(rows) != 1 || rows[0].ID != mine.ID {
		t.Fatalf("list = %+v", rows)
	}

	if rec := request(t, h, http.MethodDelete, "/api/v1/milestones/"+theirs.ID.String(), ""); rec.Code != http.StatusNotFound {
		t.Errorf("delete someone else's: %d", rec.Code)
	}
	if rec := request(t, h, http.MethodDelete, "/api/v1/milestones/"+mine.ID.String(), ""); rec.Code != http.StatusNoContent {
		t.Errorf("delete: %d", rec.Code)
	}
	if rec := request(t, h, http.MethodDelete, "/api/v1/milestones/"+mine.ID.String(), ""); rec.Code != http.StatusNotFound {
		t.Errorf("delete again: %d", rec.Code)
	}
}
