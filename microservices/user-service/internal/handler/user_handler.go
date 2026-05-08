package handler

import (
	"encoding/json"
	"net/http"
)

// UserServicer interface abstracts the service layer
type UserServicer interface {
	GetActiveUserCount() int
}

type UserHandler struct {
	service UserServicer
}

func NewUserHandler(s UserServicer) *UserHandler {
	return &UserHandler{service: s}
}

func (h *UserHandler) ActiveCount(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"count": h.service.GetActiveUserCount()})
}
