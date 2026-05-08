package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

type mockUserService struct {
	count int
}

func (m *mockUserService) GetActiveUserCount() int {
	return m.count
}

func TestActiveCountHandler(t *testing.T) {
	mock := &mockUserService{count: 42}
	h := NewUserHandler(mock)

	req := httptest.NewRequest(http.MethodGet, "/users/active-count", nil)
	w := httptest.NewRecorder()
	h.ActiveCount(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var resp map[string]int
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if resp["count"] != 42 {
		t.Errorf("count = %d, want 42", resp["count"])
	}
}
