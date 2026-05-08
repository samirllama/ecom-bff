package service

import "github.com/samirllama/ecom-bff/user-service/internal/store"

type UserService struct {
	store store.Store
}

func NewUserService(s store.Store) *UserService {
	return &UserService{store: s}
}

func (s *UserService) GetActiveUserCount() int {
	count, err := s.store.GetActiveUserCount()
	if err != nil {
		return 0 // graceful fallback
	}
	return count
}
