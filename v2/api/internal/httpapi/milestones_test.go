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
			milestone := db.Milestone{ID: uuid.New(), UserID: arg.UserID, ExerciseID: arg.ExerciseID, Weight: arg.Weight, Unit: arg.Unit, Reps: arg.Reps, RPE: arg.RPE, AchievedAt: arg.AchievedAt, Note: arg.Note}
			f.milestones = append(f.milestones, milestone)
			return milestone, nil
		}
	}
	return db.Milestone{}, pgx.ErrNoRows
}

func (f *fakeQueries) GetMilestone(_ context.Context, arg db.GetMilestoneParams) (db.Milestone, error) {
	for _, m := range f.milestones {
		if m.ID == arg.ID && m.UserID == arg.UserID {
			return m, nil
		}
	}
	return db.Milestone{}, pgx.ErrNoRows
}

func (f *fakeQueries) UpdateMilestone(_ context.Context, arg db.UpdateMilestoneParams) (db.Milestone, error) {
	for _, exercise := range f.exercises {
		if exercise.ID != arg.ExerciseID || (exercise.UserID != nil && *exercise.UserID != arg.UserID) {
			continue
		}
		for i, m := range f.milestones {
			if m.ID == arg.ID && m.UserID == arg.UserID {
				f.milestones[i] = db.Milestone{ID: m.ID, UserID: m.UserID, ExerciseID: arg.ExerciseID, Weight: arg.Weight, Unit: arg.Unit, Reps: arg.Reps, RPE: arg.RPE, AchievedAt: arg.AchievedAt, Note: arg.Note}
				return f.milestones[i], nil
			}
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
		{"rpe below 6", body(shared.ID, `,"rpe":5.5`), http.StatusBadRequest},
		{"rpe above 10", body(shared.ID, `,"rpe":10.5`), http.StatusBadRequest},
		{"rpe off the half step", body(shared.ID, `,"rpe":8.3`), http.StatusBadRequest},
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

func TestCreateMilestoneRPE(t *testing.T) {
	shared := db.Exercise{ID: uuid.New(), Name: "Squat"}
	q := &fakeQueries{exercises: []db.Exercise{shared}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	for _, rpe := range []string{"6", "8.5", "10"} {
		body := `{"exerciseId":"` + shared.ID.String() + `","weight":405,"unit":"lb","reps":1,"rpe":` + rpe + `}`
		if rec := request(t, h, http.MethodPost, "/api/v1/milestones", body); rec.Code != http.StatusCreated {
			t.Errorf("rpe %s: %d %s", rpe, rec.Code, rec.Body)
		}
	}
	if rpe := q.milestones[1].RPE; rpe == nil || *rpe != 8.5 {
		t.Errorf("rpe = %v, want 8.5", rpe)
	}
}

func TestUpdateMilestone(t *testing.T) {
	someoneElse := uuid.New()
	squat := db.Exercise{ID: uuid.New(), Name: "Squat"}
	bench := db.Exercise{ID: uuid.New(), Name: "Bench Press"}
	private := db.Exercise{ID: uuid.New(), UserID: &someoneElse, Name: "Secret Lift"}
	mine := db.Milestone{ID: uuid.New(), UserID: testUser.ID, ExerciseID: squat.ID, Weight: 405, Unit: db.WeightUnitLb, Reps: 1}
	theirs := db.Milestone{ID: uuid.New(), UserID: someoneElse, ExerciseID: squat.ID, Weight: 315, Unit: db.WeightUnitLb, Reps: 1}
	q := &fakeQueries{exercises: []db.Exercise{squat, bench, private}, milestones: []db.Milestone{mine, theirs}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	body := func(exercise uuid.UUID, extra string) string {
		return `{"exerciseId":"` + exercise.String() + `","weight":285,"unit":"lb","reps":2,"achievedAt":"2026-10-01T12:00:00Z"` + extra + `}`
	}
	path := func(id uuid.UUID) string { return "/api/v1/milestones/" + id.String() }

	cases := []struct {
		name, path, body string
		want             int
	}{
		{"someone else's milestone", path(theirs.ID), body(squat.ID, ""), http.StatusNotFound},
		{"unknown milestone", path(uuid.New()), body(squat.ID, ""), http.StatusNotFound},
		{"bad id", "/api/v1/milestones/nope", body(squat.ID, ""), http.StatusNotFound},
		{"someone else's exercise", path(mine.ID), body(private.ID, ""), http.StatusBadRequest},
		{"unknown exercise", path(mine.ID), body(uuid.New(), ""), http.StatusBadRequest},
		{"zero reps", path(mine.ID), `{"exerciseId":"` + squat.ID.String() + `","weight":285,"unit":"lb","reps":0}`, http.StatusBadRequest},
		{"no date", path(mine.ID), `{"exerciseId":"` + squat.ID.String() + `","weight":285,"unit":"lb","reps":2}`, http.StatusBadRequest},
		{"bad rpe", path(mine.ID), body(squat.ID, `,"rpe":11`), http.StatusBadRequest},
		{"long note", path(mine.ID), body(squat.ID, `,"note":"`+strings.Repeat("a", 501)+`"`), http.StatusBadRequest},
	}
	for _, c := range cases {
		if rec := request(t, h, http.MethodPatch, c.path, c.body); rec.Code != c.want {
			t.Errorf("%s: %d %s", c.name, rec.Code, rec.Body)
		}
	}
	if q.milestones[0] != mine || q.milestones[1] != theirs {
		t.Fatalf("rejected updates changed milestones: %+v", q.milestones)
	}

	rec := request(t, h, http.MethodPatch, path(mine.ID), body(bench.ID, `,"rpe":9,"note":"  belt  "`))
	if rec.Code != http.StatusOK {
		t.Fatalf("update: %d %s", rec.Code, rec.Body)
	}
	got := decode[db.Milestone](t, rec.Body.String())
	if got.ExerciseID != bench.ID || got.Weight != 285 || got.Reps != 2 {
		t.Errorf("updated = %+v", got)
	}
	if got.RPE == nil || *got.RPE != 9 {
		t.Errorf("rpe = %v, want 9", got.RPE)
	}
	if got.Note == nil || *got.Note != "belt" {
		t.Errorf("note = %v, want trimmed", got.Note)
	}

	rec = request(t, h, http.MethodPatch, path(mine.ID), body(bench.ID, ""))
	if updated := decode[db.Milestone](t, rec.Body.String()); updated.RPE != nil || updated.Note != nil {
		t.Errorf("clearing rpe and note: %+v", updated)
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
