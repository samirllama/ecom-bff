package service

import (
	"sort"

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
	return len(s.store.GetAll())
}

func (s *ProductService) GetTop(limit int) []model.Product {
	products := s.store.GetAll()
	sort.Slice(products, func(i, j int) bool {
		return products[i].SalesCount > products[j].SalesCount
	})

	if limit > len(products) {
		limit = len(products)
	}
	return products[:limit]
}

func (s *ProductService) List(category string, page, limit int) ([]model.Product, int) {
	all := s.store.GetAll()
	filtered := []model.Product{}
	for _, p := range all {
		if category == "" || p.Category == category {
			filtered = append(filtered, p)
		}
	}

	start := (page - 1) * limit
	if start > len(filtered) {
		start = len(filtered)
	}
	end := start + limit
	if end > len(filtered) {
		end = len(filtered)
	}

	return filtered[start:end], len(filtered)
}

func (s *ProductService) GetByID(id string) (model.Product, bool) {
	return s.store.GetByID(id)
}
