package store

import (
	"sync"

	"github.com/samirllama/ecom-bff/product-service/internal/model"
)

type Store interface {
	GetAll() []model.Product
	GetByID(id string) (model.Product, bool)
}

type MemoryStore struct {
	sync.RWMutex
	products map[string]model.Product
}

func NewMemoryStore() *MemoryStore {
	s := &MemoryStore{
		products: make(map[string]model.Product),
	}
	s.seed()
	return s
}

func (s *MemoryStore) seed() {
	initialProducts := []model.Product{
		{ID: "1", Name: "Laptop Pro", Price: 1299.99, Stock: 50, Category: "Electronics", SalesCount: 150, Revenue: 194998.50, Image: "laptop.jpg"},
		{ID: "2", Name: "Smartphone X", Price: 899.99, Stock: 100, Category: "Electronics", SalesCount: 200, Revenue: 179998.00, Image: "phone.jpg"},
		{ID: "3", Name: "Wireless Headphones", Price: 199.99, Stock: 200, Category: "Accessories", SalesCount: 300, Revenue: 59997.00, Image: "headphones.jpg"},
		{ID: "4", Name: "Smart Watch", Price: 349.99, Stock: 75, Category: "Wearables", SalesCount: 120, Revenue: 41998.80, Image: "watch.jpg"},
		{ID: "5", Name: "Tablet Air", Price: 599.99, Stock: 60, Category: "Electronics", SalesCount: 90, Revenue: 53999.10, Image: "tablet.jpg"},
	}
	for _, p := range initialProducts {
		s.products[p.ID] = p
	}
}

func (s *MemoryStore) GetAll() []model.Product {
	s.RLock()
	defer s.RUnlock()
	res := make([]model.Product, 0, len(s.products))
	for _, p := range s.products {
		res = append(res, p)
	}
	return res
}

func (s *MemoryStore) GetByID(id string) (model.Product, bool) {
	s.RLock()
	defer s.RUnlock()
	p, ok := s.products[id]
	return p, ok
}
