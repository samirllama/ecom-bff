package service

import (
	"github.com/samirllama/ecom-bff/user-service/internal/store"
)

type UserService struct {
	store store.Store
}

func NewUserService(s store.Store) *UserService {
	return &UserService{store: s}
}

func (s *UserService) GetActiveCount() int {
	return s.store.GetActiveCount()
}
