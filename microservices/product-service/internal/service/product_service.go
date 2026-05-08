package service

import (
	"github.com/samirllama/ecom-bff/product-service/internal/model"
	"github.com/samirllama/ecom-bff/product-service/internal/store"
)

type ProductService struct {
	store store.Store
}

func NewProductService(s store.Store) *ProductService {
	return &ProductService{store: s}
}

func (s *ProductService) GetCount() int {
	c, err := s.store.GetCount()
	if err != nil {
		return 0
	}
	return c
}

func (s *ProductService) GetTop(limit int) []model.Product {
	p, err := s.store.GetTop(limit)
	if err != nil {
		return []model.Product{}
	}
	return p
}

// List returns products and total count (not pages).
func (s *ProductService) List(category string, page, limit int) ([]model.Product, int) {
	products, total, err := s.store.List(category, page, limit)
	if err != nil {
		return []model.Product{}, 0
	}
	return products, total
}

// GetByID returns the product and a boolean indicating if it was found.
func (s *ProductService) GetByID(id string) (model.Product, bool) {
	p, found, err := s.store.GetByID(id)
	if err != nil || !found {
		return model.Product{}, false
	}
	return p, true
}
