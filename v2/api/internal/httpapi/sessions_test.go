package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jamesschuler/swol/v2/api/internal/db"
)

func (f *fakeQueries) find(id, userID uuid.UUID, statuses ...db.SessionStatus) (*db.WorkoutSession, error) {
	for i := range f.sessions {
		session := &f.sessions[i]
		if session.ID != id || session.UserID != userID {
			continue
		}
		for _, status := range statuses {
			if session.Status == status {
				return session, nil
			}
		}
	}
	return nil, pgx.ErrNoRows
}

func (f *fakeQueries) StartSession(_ context.Context, userID uuid.UUID) (db.WorkoutSession, error) {
	if _, err := f.GetOpenSession(context.Background(), userID); err == nil {
		return db.WorkoutSession{}, &pgconn.PgError{Code: "23505"}
	}
	session := db.WorkoutSession{ID: uuid.New(), UserID: userID, Status: db.SessionStatusActive, StartedAt: time.Now()}
	f.sessions = append(f.sessions, session)
	return session, nil
}

func (f *fakeQueries) CheckIn(_ context.Context, arg db.CheckInParams) (db.WorkoutSession, error) {
	session := db.WorkoutSession{ID: uuid.New(), UserID: arg.UserID, Kind: db.SessionKindCheckIn, Status: db.SessionStatusCompleted, StartedAt: arg.CheckedInAt, EndedAt: &arg.CheckedInAt}
	f.sessions = append(f.sessions, session)
	return session, nil
}

func (f *fakeQueries) GetOpenSession(_ context.Context, userID uuid.UUID) (db.WorkoutSession, error) {
	for _, session := range f.sessions {
		if session.UserID == userID && session.Status != db.SessionStatusCompleted {
			return session, nil
		}
	}
	return db.WorkoutSession{}, pgx.ErrNoRows
}

func (f *fakeQueries) GetSession(_ context.Context, arg db.GetSessionParams) (db.WorkoutSession, error) {
	session, err := f.find(arg.ID, arg.UserID, db.SessionStatusActive, db.SessionStatusPaused, db.SessionStatusCompleted)
	if err != nil {
		return db.WorkoutSession{}, err
	}
	return *session, nil
}

func (f *fakeQueries) ListSessions(_ context.Context, userID uuid.UUID) ([]db.WorkoutSession, error) {
	sessions := []db.WorkoutSession{}
	for _, session := range f.sessions {
		if session.UserID == userID {
			sessions = append(sessions, session)
		}
	}
	return sessions, nil
}

func (f *fakeQueries) setStatus(id, userID uuid.UUID, to db.SessionStatus, from ...db.SessionStatus) (db.WorkoutSession, error) {
	session, err := f.find(id, userID, from...)
	if err != nil {
		return db.WorkoutSession{}, err
	}
	session.Status = to
	return *session, nil
}

func (f *fakeQueries) PauseSession(_ context.Context, arg db.PauseSessionParams) (db.WorkoutSession, error) {
	return f.setStatus(arg.ID, arg.UserID, db.SessionStatusPaused, db.SessionStatusActive)
}

func (f *fakeQueries) ResumeSession(_ context.Context, arg db.ResumeSessionParams) (db.WorkoutSession, error) {
	return f.setStatus(arg.ID, arg.UserID, db.SessionStatusActive, db.SessionStatusPaused)
}

func (f *fakeQueries) EndSession(_ context.Context, arg db.EndSessionParams) (db.WorkoutSession, error) {
	return f.setStatus(arg.ID, arg.UserID, db.SessionStatusCompleted, db.SessionStatusActive, db.SessionStatusPaused)
}

func (f *fakeQueries) DeleteSession(_ context.Context, arg db.DeleteSessionParams) (int64, error) {
	for i, session := range f.sessions {
		if session.ID == arg.ID && session.UserID == arg.UserID {
			f.sessions = append(f.sessions[:i], f.sessions[i+1:]...)
			return 1, nil
		}
	}
	return 0, nil
}

func (f *fakeQueries) UpdateSessionNotes(_ context.Context, arg db.UpdateSessionNotesParams) (db.WorkoutSession, error) {
	session, err := f.find(arg.ID, arg.UserID, db.SessionStatusActive, db.SessionStatusPaused, db.SessionStatusCompleted)
	if err != nil {
		return db.WorkoutSession{}, err
	}
	session.Notes = arg.Notes
	return *session, nil
}

func decode[T any](t *testing.T, body string) T {
	t.Helper()
	var v T
	if err := json.Unmarshal([]byte(body), &v); err != nil {
		t.Fatalf("decode %q: %v", body, err)
	}
	return v
}

func TestSessionLifecycle(t *testing.T) {
	h := NewHandler(&fakeQueries{}, fakeAuth{allow: true}, nil)

	if rec := request(t, h, http.MethodGet, "/api/v1/sessions/current", ""); rec.Code != http.StatusOK || strings.TrimSpace(rec.Body.String()) != "null" {
		t.Fatalf("no current: %d %s", rec.Code, rec.Body)
	}

	rec := request(t, h, http.MethodPost, "/api/v1/sessions", "")
	if rec.Code != http.StatusCreated {
		t.Fatalf("start: %d %s", rec.Code, rec.Body)
	}
	session := decode[db.WorkoutSession](t, rec.Body.String())
	path := "/api/v1/sessions/" + session.ID.String()

	steps := []struct {
		method, path string
		want         int
		status       db.SessionStatus
	}{
		{http.MethodPost, "/api/v1/sessions", http.StatusConflict, ""},
		{http.MethodGet, "/api/v1/sessions/current", http.StatusOK, db.SessionStatusActive},
		{http.MethodPost, path + "/resume", http.StatusConflict, ""},
		{http.MethodPost, path + "/pause", http.StatusOK, db.SessionStatusPaused},
		{http.MethodPost, path + "/pause", http.StatusConflict, ""},
		{http.MethodPost, path + "/resume", http.StatusOK, db.SessionStatusActive},
		{http.MethodPost, path + "/end", http.StatusOK, db.SessionStatusCompleted},
		{http.MethodPost, path + "/end", http.StatusConflict, ""},
	}
	for _, step := range steps {
		rec := request(t, h, step.method, step.path, "")
		if rec.Code != step.want {
			t.Fatalf("%s %s: %d %s", step.method, step.path, rec.Code, rec.Body)
		}
		if step.status != "" && decode[db.WorkoutSession](t, rec.Body.String()).Status != step.status {
			t.Fatalf("%s %s: status %s", step.method, step.path, rec.Body)
		}
	}

	if rec := request(t, h, http.MethodGet, "/api/v1/sessions/current", ""); strings.TrimSpace(rec.Body.String()) != "null" {
		t.Fatalf("current after end: %s", rec.Body)
	}
	if rec := request(t, h, http.MethodGet, "/api/v1/sessions", ""); len(decode[[]db.WorkoutSession](t, rec.Body.String())) != 1 {
		t.Fatalf("list: %s", rec.Body)
	}
	if rec := request(t, h, http.MethodPost, "/api/v1/sessions", ""); rec.Code != http.StatusCreated {
		t.Fatalf("start after end: %d", rec.Code)
	}
}

func TestCheckIn(t *testing.T) {
	h := NewHandler(&fakeQueries{}, fakeAuth{allow: true}, nil)
	future := time.Now().Add(time.Hour).Format(time.RFC3339)
	past := time.Date(2026, 9, 1, 12, 0, 0, 0, time.UTC)

	cases := []struct {
		name, body string
		want       int
	}{
		{"now", `{}`, http.StatusCreated},
		{"backdated", `{"checkedInAt":"` + past.Format(time.RFC3339) + `"}`, http.StatusCreated},
		{"future", `{"checkedInAt":"` + future + `"}`, http.StatusBadRequest},
		{"not a time", `{"checkedInAt":"yesterday"}`, http.StatusBadRequest},
	}
	for _, c := range cases {
		rec := request(t, h, http.MethodPost, "/api/v1/sessions/check-in", c.body)
		if rec.Code != c.want {
			t.Fatalf("%s: %d %s", c.name, rec.Code, rec.Body)
		}
		if c.want != http.StatusCreated {
			continue
		}
		session := decode[db.WorkoutSession](t, rec.Body.String())
		if session.Kind != db.SessionKindCheckIn || session.Status != db.SessionStatusCompleted {
			t.Fatalf("%s: %+v", c.name, session)
		}
		if c.name == "backdated" && !session.StartedAt.Equal(past) {
			t.Fatalf("backdated started at %s", session.StartedAt)
		}
	}

	if rec := request(t, h, http.MethodPost, "/api/v1/sessions", ""); rec.Code != http.StatusCreated {
		t.Fatalf("check-ins should not block starting a workout: %d", rec.Code)
	}
}

func TestSessionNotFound(t *testing.T) {
	other := db.WorkoutSession{ID: uuid.New(), UserID: uuid.New(), Status: db.SessionStatusActive}
	h := NewHandler(&fakeQueries{sessions: []db.WorkoutSession{other}}, fakeAuth{allow: true}, nil)
	path := "/api/v1/sessions/" + other.ID.String()

	cases := []struct{ method, path, body string }{
		{http.MethodGet, path, ""},
		{http.MethodPost, path + "/pause", ""},
		{http.MethodPost, path + "/end", ""},
		{http.MethodDelete, path, ""},
		{http.MethodPatch, path, `{"notes":"hi"}`},
		{http.MethodGet, "/api/v1/sessions/not-a-uuid", ""},
	}
	for _, c := range cases {
		if rec := request(t, h, c.method, c.path, c.body); rec.Code != http.StatusNotFound {
			t.Errorf("%s %s: %d", c.method, c.path, rec.Code)
		}
	}
}

func TestUpdateSessionNotes(t *testing.T) {
	session := db.WorkoutSession{ID: uuid.New(), UserID: testUser.ID, Status: db.SessionStatusActive}
	h := NewHandler(&fakeQueries{sessions: []db.WorkoutSession{session}}, fakeAuth{allow: true}, nil)
	path := "/api/v1/sessions/" + session.ID.String()

	if rec := request(t, h, http.MethodPatch, path, `{"notes":"`+strings.Repeat("a", 5001)+`"}`); rec.Code != http.StatusBadRequest {
		t.Fatalf("too long status = %d", rec.Code)
	}

	rec := request(t, h, http.MethodPatch, path, `{"notes":"  squats felt heavy\nbench PR  "}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("update: %d %s", rec.Code, rec.Body)
	}
	if notes := decode[db.WorkoutSession](t, rec.Body.String()).Notes; notes == nil || *notes != "squats felt heavy\nbench PR" {
		t.Fatalf("notes = %v", notes)
	}
	if notes := decode[db.WorkoutSession](t, request(t, h, http.MethodGet, path, "").Body.String()).Notes; notes == nil {
		t.Fatal("notes missing from get")
	}

	rec = request(t, h, http.MethodPatch, path, `{"notes":"   "}`)
	if notes := decode[db.WorkoutSession](t, rec.Body.String()).Notes; rec.Code != http.StatusOK || notes != nil {
		t.Fatalf("clear: %d %v", rec.Code, notes)
	}
}

func TestDeleteSession(t *testing.T) {
	session := db.WorkoutSession{ID: uuid.New(), UserID: testUser.ID, Status: db.SessionStatusCompleted}
	q := &fakeQueries{sessions: []db.WorkoutSession{session}}
	h := NewHandler(q, fakeAuth{allow: true}, nil)
	path := "/api/v1/sessions/" + session.ID.String()

	if rec := request(t, h, http.MethodDelete, path, ""); rec.Code != http.StatusNoContent || len(q.sessions) != 0 {
		t.Fatalf("delete: %d", rec.Code)
	}
	if rec := request(t, h, http.MethodDelete, path, ""); rec.Code != http.StatusNotFound {
		t.Fatalf("delete again: %d", rec.Code)
	}
}
