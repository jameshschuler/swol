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

func (f *fakeQueries) ListGoals(_ context.Context, userID uuid.UUID) ([]db.ListGoalsRow, error) {
	rows := []db.ListGoalsRow{}
	for _, g := range f.goals {
		if g.UserID == userID {
			rows = append(rows, db.ListGoalsRow{ID: g.ID, ExerciseID: g.ExerciseID, TargetWeight: g.TargetWeight, Unit: g.Unit, TargetWeightKg: g.TargetWeightKg, TargetReps: g.TargetReps, CompletedAt: g.CompletedAt})
		}
	}
	return rows, nil
}

func (f *fakeQueries) CreateGoal(_ context.Context, arg db.CreateGoalParams) (db.Goal, error) {
	for _, exercise := range f.exercises {
		if exercise.ID == arg.ExerciseID && (exercise.UserID == nil || *exercise.UserID == arg.UserID) {
			goal := db.Goal{ID: uuid.New(), UserID: arg.UserID, ExerciseID: arg.ExerciseID, TargetWeight: arg.TargetWeight, Unit: arg.Unit, TargetReps: arg.TargetReps}
			f.goals = append(f.goals, goal)
			return goal, nil
		}
	}
	return db.Goal{}, pgx.ErrNoRows
}

func (f *fakeQueries) CompleteGoal(_ context.Context, arg db.CompleteGoalParams) (db.Goal, error) {
	for i := range f.goals {
		goal := &f.goals[i]
		if goal.ID != arg.ID || goal.UserID != arg.UserID || goal.CompletedAt != nil {
			continue
		}
		for _, m := range f.milestones {
			if m.ID == arg.MilestoneID && m.UserID == goal.UserID && m.ExerciseID == goal.ExerciseID && m.WeightKg >= goal.TargetWeightKg && m.Reps >= goal.TargetReps {
				now := time.Now()
				goal.CompletedAt = &now
				goal.CompletedMilestoneID = &m.ID
				return *goal, nil
			}
		}
	}
	return db.Goal{}, pgx.ErrNoRows
}

func (f *fakeQueries) UpdateGoal(_ context.Context, arg db.UpdateGoalParams) (db.Goal, error) {
	for i := range f.goals {
		goal := &f.goals[i]
		if goal.ID == arg.ID && goal.UserID == arg.UserID && goal.CompletedAt == nil {
			goal.TargetWeight, goal.Unit, goal.TargetReps = arg.TargetWeight, arg.Unit, arg.TargetReps
			return *goal, nil
		}
	}
	return db.Goal{}, pgx.ErrNoRows
}

func (f *fakeQueries) GetGoal(_ context.Context, arg db.GetGoalParams) (db.Goal, error) {
	for _, g := range f.goals {
		if g.ID == arg.ID && g.UserID == arg.UserID {
			return g, nil
		}
	}
	return db.Goal{}, pgx.ErrNoRows
}

func (f *fakeQueries) DeleteGoal(_ context.Context, arg db.DeleteGoalParams) (int64, error) {
	for i, g := range f.goals {
		if g.ID == arg.ID && g.UserID == arg.UserID {
			f.goals = append(f.goals[:i], f.goals[i+1:]...)
			return 1, nil
		}
	}
	return 0, nil
}

func TestCreateGoal(t *testing.T) {
	shared := db.Exercise{ID: uuid.New(), Name: "Bench Press"}
	someoneElse := uuid.New()
	private := db.Exercise{ID: uuid.New(), UserID: &someoneElse, Name: "Secret"}
	q := &fakeQueries{exercises: []db.Exercise{shared, private}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	body := func(exercise uuid.UUID, rest string) string {
		return `{"exerciseId":"` + exercise.String() + `",` + rest + `}`
	}
	cases := []struct {
		name, body string
		want       int
	}{
		{"valid", body(shared.ID, `"targetWeight":225,"unit":"lb","targetReps":1`), http.StatusCreated},
		{"someone else's exercise", body(private.ID, `"targetWeight":225,"unit":"lb","targetReps":1`), http.StatusBadRequest},
		{"zero weight", body(shared.ID, `"targetWeight":0,"unit":"lb","targetReps":1`), http.StatusBadRequest},
		{"bad unit", body(shared.ID, `"targetWeight":100,"unit":"stone","targetReps":1`), http.StatusBadRequest},
		{"zero reps", body(shared.ID, `"targetWeight":100,"unit":"kg","targetReps":0`), http.StatusBadRequest},
	}
	for _, c := range cases {
		if rec := request(t, h, http.MethodPost, "/api/v1/goals", c.body); rec.Code != c.want {
			t.Errorf("%s: %d %s", c.name, rec.Code, rec.Body)
		}
	}
	if len(q.goals) != 1 {
		t.Fatalf("saved %d goals, want 1", len(q.goals))
	}
}

func TestCompleteGoal(t *testing.T) {
	bench := uuid.New()
	goal := db.Goal{ID: uuid.New(), UserID: testUser.ID, ExerciseID: bench, TargetWeight: 100, Unit: db.WeightUnitKg, TargetWeightKg: 100, TargetReps: 3}
	meets := db.Milestone{ID: uuid.New(), UserID: testUser.ID, ExerciseID: bench, WeightKg: 102, Reps: 3}
	tooFewReps := db.Milestone{ID: uuid.New(), UserID: testUser.ID, ExerciseID: bench, WeightKg: 110, Reps: 1}
	otherExercise := db.Milestone{ID: uuid.New(), UserID: testUser.ID, ExerciseID: uuid.New(), WeightKg: 200, Reps: 5}
	q := &fakeQueries{goals: []db.Goal{goal}, milestones: []db.Milestone{meets, tooFewReps, otherExercise}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)
	path := "/api/v1/goals/" + goal.ID.String() + "/complete"
	with := func(m db.Milestone) string { return `{"milestoneId":"` + m.ID.String() + `"}` }

	if rec := request(t, h, http.MethodPost, path, `{}`); rec.Code != http.StatusBadRequest {
		t.Errorf("missing milestone: %d", rec.Code)
	}
	if rec := request(t, h, http.MethodPost, path, with(tooFewReps)); rec.Code != http.StatusConflict {
		t.Errorf("too few reps: %d", rec.Code)
	}
	if rec := request(t, h, http.MethodPost, path, with(otherExercise)); rec.Code != http.StatusConflict {
		t.Errorf("other exercise: %d", rec.Code)
	}
	rec := request(t, h, http.MethodPost, path, with(meets))
	if rec.Code != http.StatusOK {
		t.Fatalf("complete: %d %s", rec.Code, rec.Body)
	}
	if done := decode[db.Goal](t, rec.Body.String()); done.CompletedAt == nil || *done.CompletedMilestoneID != meets.ID {
		t.Fatalf("not completed: %+v", done)
	}
	if rec := request(t, h, http.MethodPost, path, with(meets)); rec.Code != http.StatusConflict || !strings.Contains(rec.Body.String(), "already complete") {
		t.Errorf("complete again: %d %s", rec.Code, rec.Body)
	}
	if rec := request(t, h, http.MethodPost, "/api/v1/goals/"+uuid.NewString()+"/complete", with(meets)); rec.Code != http.StatusNotFound {
		t.Errorf("unknown goal: %d", rec.Code)
	}
}

func TestListAndDeleteGoals(t *testing.T) {
	mine := db.Goal{ID: uuid.New(), UserID: testUser.ID}
	theirs := db.Goal{ID: uuid.New(), UserID: uuid.New()}
	q := &fakeQueries{goals: []db.Goal{mine, theirs}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	if rows := decode[[]db.ListGoalsRow](t, request(t, h, http.MethodGet, "/api/v1/goals", "").Body.String()); len(rows) != 1 || rows[0].ID != mine.ID {
		t.Fatalf("list = %+v", rows)
	}
	if rec := request(t, h, http.MethodDelete, "/api/v1/goals/"+theirs.ID.String(), ""); rec.Code != http.StatusNotFound {
		t.Errorf("delete someone else's: %d", rec.Code)
	}
	if rec := request(t, h, http.MethodDelete, "/api/v1/goals/"+mine.ID.String(), ""); rec.Code != http.StatusNoContent {
		t.Errorf("delete: %d", rec.Code)
	}
}

func TestUpdateGoal(t *testing.T) {
	now := time.Now()
	open := db.Goal{ID: uuid.New(), UserID: testUser.ID, TargetWeight: 100, Unit: db.WeightUnitKg, TargetReps: 1}
	done := db.Goal{ID: uuid.New(), UserID: testUser.ID, TargetWeight: 100, Unit: db.WeightUnitKg, TargetReps: 1, CompletedAt: &now}
	q := &fakeQueries{goals: []db.Goal{open, done}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)

	rec := request(t, h, http.MethodPatch, "/api/v1/goals/"+open.ID.String(), `{"targetWeight":250,"unit":"lb","targetReps":3}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("update: %d %s", rec.Code, rec.Body)
	}
	if got := decode[db.Goal](t, rec.Body.String()); got.TargetWeight != 250 || got.Unit != db.WeightUnitLb || got.TargetReps != 3 {
		t.Fatalf("updated goal = %+v", got)
	}

	cases := []struct {
		name, path, body string
		want             int
	}{
		{"invalid weight", open.ID.String(), `{"targetWeight":0,"unit":"lb","targetReps":3}`, http.StatusBadRequest},
		{"completed goal", done.ID.String(), `{"targetWeight":250,"unit":"lb","targetReps":3}`, http.StatusConflict},
		{"unknown goal", uuid.NewString(), `{"targetWeight":250,"unit":"lb","targetReps":3}`, http.StatusNotFound},
	}
	for _, c := range cases {
		if rec := request(t, h, http.MethodPatch, "/api/v1/goals/"+c.path, c.body); rec.Code != c.want {
			t.Errorf("%s: %d %s", c.name, rec.Code, rec.Body)
		}
	}
}
