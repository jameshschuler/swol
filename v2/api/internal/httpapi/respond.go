package httpapi

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
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
		var apiErr apiError
		if errors.As(err, &apiErr) {
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
