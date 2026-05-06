package store

import (
	"sync"

	"github.com/samirllama/ecom-bff/user-service/internal/model"
)

type Store interface {
	GetActiveCount() int
}

type MemoryStore struct {
	sync.RWMutex
	users map[string]model.User
}

func NewMemoryStore() *MemoryStore {
	s := &MemoryStore{
		users: make(map[string]model.User),
	}
	s.seed()
	return s
}

func (s *MemoryStore) seed() {
	// Mocking active users for demo
	initialUsers := []model.User{
		{ID: "1", Email: "admin@example.com", Role: "admin"},
		{ID: "2", Email: "user1@example.com", Role: "user"},
	}
	for _, u := range initialUsers {
		s.users[u.ID] = u
	}
}

func (s *MemoryStore) GetActiveCount() int {
	s.RLock()
	defer s.RUnlock()
	// In a real app, this might query an "active" status or session table
	// For this mock, we'll return a fixed but slightly variable number
	return 128 + len(s.users)
}
