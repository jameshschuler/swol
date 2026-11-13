package httpapi

import (
	"context"
	"errors"
	"net/http"
	"slices"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

func (f *fakeQueries) GetOwnExercise(_ context.Context, arg db.GetOwnExerciseParams) (db.Exercise, error) {
	for _, e := range f.exercises {
		if e.ID == arg.ID && e.UserID != nil && *e.UserID == arg.UserID {
			return e, nil
		}
	}
	return db.Exercise{}, pgx.ErrNoRows
}

func (f *fakeQueries) UpdateExercise(ctx context.Context, arg db.UpdateExerciseParams) (db.Exercise, error) {
	if _, err := f.GetOwnExercise(ctx, db.GetOwnExerciseParams{ID: arg.ID, UserID: arg.UserID}); err != nil {
		return db.Exercise{}, err
	}
	if arg.BaseExerciseID != nil && (*arg.BaseExerciseID == arg.ID || !f.isBaseFor(*arg.BaseExerciseID, arg.UserID) || f.hasVariations(arg.ID)) {
		return db.Exercise{}, pgx.ErrNoRows
	}
	for _, e := range f.exercises {
		if e.ID != arg.ID && e.UserID != nil && *e.UserID == arg.UserID && strings.EqualFold(e.Name, arg.Name) {
			return db.Exercise{}, &pgconn.PgError{Code: "23505"}
		}
	}
	return db.Exercise{ID: arg.ID, UserID: &arg.UserID, Name: arg.Name, BaseExerciseID: arg.BaseExerciseID}, nil
}

func (f *fakeQueries) hasVariations(id uuid.UUID) bool {
	for _, e := range f.exercises {
		if e.BaseExerciseID != nil && *e.BaseExerciseID == id {
			return true
		}
	}
	return false
}

func (f *fakeQueries) DeleteExercise(ctx context.Context, arg db.DeleteExerciseParams) (int64, error) {
	if _, err := f.GetOwnExercise(ctx, db.GetOwnExerciseParams(arg)); errors.Is(err, pgx.ErrNoRows) {
		return 0, nil
	}
	for _, m := range f.milestones {
		if m.ExerciseID == arg.ID {
			return 0, &pgconn.PgError{Code: "23503"}
		}
	}
	for _, g := range f.goals {
		if g.ExerciseID == arg.ID {
			return 0, &pgconn.PgError{Code: "23503"}
		}
	}
	f.exercises = slices.DeleteFunc(f.exercises, func(e db.Exercise) bool { return e.ID == arg.ID })
	return 1, nil
}

func TestUpdateExercise(t *testing.T) {
	someoneElse := uuid.New()
	squat := db.Exercise{ID: uuid.New(), Name: "Squat"}
	frontSquat := db.Exercise{ID: uuid.New(), Name: "Front Squat", BaseExerciseID: &squat.ID}
	pinSquat := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Pin Squat"}
	hackSquat := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Hack Squat"}
	beltSquat := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Belt Squat", BaseExerciseID: &hackSquat.ID}
	private := db.Exercise{ID: uuid.New(), UserID: &someoneElse, Name: "Secret Lift"}
	exercises := []db.Exercise{squat, frontSquat, pinSquat, hackSquat, beltSquat, private}

	body := func(name string, base *uuid.UUID) string {
		if base == nil {
			return `{"name":"` + name + `","baseExerciseId":null}`
		}
		return `{"name":"` + name + `","baseExerciseId":"` + base.String() + `"}`
	}
	cases := []struct {
		name string
		id   uuid.UUID
		body string
		want int
	}{
		{"rename", pinSquat.ID, body("Pin Squats", nil), http.StatusOK},
		{"set shared base", pinSquat.ID, body("Pin Squat", &squat.ID), http.StatusOK},
		{"set own base", pinSquat.ID, body("Pin Squat", &hackSquat.ID), http.StatusOK},
		{"clear base", beltSquat.ID, body("Belt Squat", nil), http.StatusOK},
		{"blank name", pinSquat.ID, body("  ", nil), http.StatusBadRequest},
		{"duplicate name", pinSquat.ID, body("hack squat", nil), http.StatusConflict},
		{"base is itself", pinSquat.ID, body("Pin Squat", &pinSquat.ID), http.StatusBadRequest},
		{"base is a variation", pinSquat.ID, body("Pin Squat", &frontSquat.ID), http.StatusBadRequest},
		{"base is someone else's", pinSquat.ID, body("Pin Squat", &private.ID), http.StatusBadRequest},
		{"exercise has variations", hackSquat.ID, body("Hack Squat", &squat.ID), http.StatusBadRequest},
		{"rename exercise with variations", hackSquat.ID, body("Hack Squats", nil), http.StatusOK},
		{"shared exercise", squat.ID, body("Squats", nil), http.StatusNotFound},
		{"someone else's exercise", private.ID, body("Mine Now", nil), http.StatusNotFound},
		{"unknown exercise", uuid.New(), body("Pin Squat", nil), http.StatusNotFound},
	}
	for _, c := range cases {
		h := NewHandler(&fakeQueries{exercises: slices.Clone(exercises)}, fakeAuth{allow: true}, nil)
		if rec := request(t, h, http.MethodPatch, "/api/v1/exercises/"+c.id.String(), c.body); rec.Code != c.want {
			t.Errorf("%s: %d %s", c.name, rec.Code, rec.Body)
		}
	}
}

func TestUpdateExerciseReturnsSaved(t *testing.T) {
	squat := db.Exercise{ID: uuid.New(), Name: "Squat"}
	pinSquat := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Pin Squat"}
	h := NewHandler(&fakeQueries{exercises: []db.Exercise{squat, pinSquat}}, fakeAuth{allow: true}, nil)

	rec := request(t, h, http.MethodPatch, "/api/v1/exercises/"+pinSquat.ID.String(), `{"name":" Pin Squats ","baseExerciseId":"`+squat.ID.String()+`"}`)
	saved := decode[db.Exercise](t, rec.Body.String())
	if saved.Name != "Pin Squats" || saved.BaseExerciseID == nil || *saved.BaseExerciseID != squat.ID {
		t.Errorf("saved = %+v", saved)
	}
}

func TestDeleteExercise(t *testing.T) {
	someoneElse := uuid.New()
	squat := db.Exercise{ID: uuid.New(), Name: "Squat"}
	unused := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Pin Squat"}
	withMilestone := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Hack Squat"}
	withGoal := db.Exercise{ID: uuid.New(), UserID: &testUser.ID, Name: "Belt Squat"}
	private := db.Exercise{ID: uuid.New(), UserID: &someoneElse, Name: "Secret Lift"}
	milestones := []db.Milestone{{ID: uuid.New(), UserID: testUser.ID, ExerciseID: withMilestone.ID}}
	goals := []db.Goal{{ID: uuid.New(), UserID: testUser.ID, ExerciseID: withGoal.ID}}
	exercises := []db.Exercise{squat, unused, withMilestone, withGoal, private}

	cases := []struct {
		name string
		id   uuid.UUID
		want int
	}{
		{"unused", unused.ID, http.StatusNoContent},
		{"has a milestone", withMilestone.ID, http.StatusConflict},
		{"has a goal", withGoal.ID, http.StatusConflict},
		{"shared exercise", squat.ID, http.StatusNotFound},
		{"someone else's exercise", private.ID, http.StatusNotFound},
		{"unknown exercise", uuid.New(), http.StatusNotFound},
	}
	for _, c := range cases {
		q := &fakeQueries{exercises: slices.Clone(exercises), milestones: milestones, goals: goals}
		h := NewHandler(q, fakeAuth{allow: true}, nil)
		if rec := request(t, h, http.MethodDelete, "/api/v1/exercises/"+c.id.String(), ""); rec.Code != c.want {
			t.Errorf("%s: %d %s", c.name, rec.Code, rec.Body)
		}
	}
}
