package httpapi

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"
	"unicode/utf8"
)

type apiError struct {
	status  int
	message string
}

func (e apiError) Error() string {
	return e.message
}

func badRequest(message string) error {
	return apiError{status: http.StatusBadRequest, message: message}
}

func notFound(message string) error {
	return apiError{status: http.StatusNotFound, message: message}
}

func conflict(message string) error {
	return apiError{status: http.StatusConflict, message: message}
}

type handlerFunc func(w http.ResponseWriter, r *http.Request) error

func handle(fn handlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := fn(w, r)
		if err == nil {
			return
		}
		if apiErr, ok := errors.AsType[apiError](err); ok {
			writeJSON(w, apiErr.status, map[string]string{"error": apiErr.message})
			return
		}
		slog.Error("request failed", "method", r.Method, "path", r.URL.Path, "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func decodeJSON(r *http.Request, dst any) error {
	decoder := json.NewDecoder(http.MaxBytesReader(nil, r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(dst); err != nil {
		return badRequest("invalid request body")
	}
	return nil
}

const clockSkew = 5 * time.Minute

func isInFuture(t time.Time) bool {
	return t.After(time.Now().Add(clockSkew))
}

func tooLong(s string, maxChars int) bool {
	return utf8.RuneCountInString(s) > maxChars
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
