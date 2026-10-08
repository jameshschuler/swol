package auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/google/uuid"
	gotrue "github.com/supabase-community/auth-go"
)

type User struct {
	ID    uuid.UUID
	Email string
}

type contextKey struct{}

type Supabase struct {
	client gotrue.Client
}

func NewSupabase(supabaseURL, publishableKey string) *Supabase {
	authURL := strings.TrimRight(supabaseURL, "/") + "/auth/v1"
	return &Supabase{client: gotrue.New("", publishableKey).WithCustomAuthURL(authURL)}
}

func (s *Supabase) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
		if !ok || token == "" {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}
		res, err := s.client.WithToken(token).GetUser()
		if err != nil {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}
		user := User{ID: res.ID, Email: res.Email}
		next.ServeHTTP(w, r.WithContext(WithUser(r.Context(), user)))
	})
}

func WithUser(ctx context.Context, user User) context.Context {
	return context.WithValue(ctx, contextKey{}, user)
}

func FromContext(ctx context.Context) User {
	user, _ := ctx.Value(contextKey{}).(User)
	return user
}
