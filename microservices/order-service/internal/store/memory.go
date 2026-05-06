package store

import (
	"sync"

	"github.com/samirllama/ecom-bff/order-service/internal/model"
)

type Store interface {
	GetAll() []model.Order
	GetByID(id string) (model.Order, bool)
	UpdateStatus(id, status string) (model.Order, bool)
}

type MemoryStore struct {
	sync.RWMutex
	orders map[string]model.Order
}

func NewMemoryStore() *MemoryStore {
	s := &MemoryStore{
		orders: make(map[string]model.Order),
	}
	s.seed()
	return s
}

func (s *MemoryStore) seed() {
	initialOrders := []model.Order{
		{
			ID:           "ORD-001",
			CustomerName: "John Doe",
			Products: []model.OrderProduct{
				{ProductID: "1", ProductName: "Laptop Pro", Quantity: 1, Price: 1299.99},
			},
			TotalAmount:     1299.99,
			Status:          "completed",
			CreatedAt:       "2024-01-15T10:30:00Z",
			ShippingAddress: "123 Main St, City, Country",
		},
		{
			ID:           "ORD-002",
			CustomerName: "Jane Smith",
			Products: []model.OrderProduct{
				{ProductID: "2", ProductName: "Smartphone X", Quantity: 2, Price: 899.99},
			},
			TotalAmount:     1799.98,
			Status:          "processing",
			CreatedAt:       "2024-01-20T14:20:00Z",
			ShippingAddress: "456 Oak Ave, Town, Country",
		},
		{
			ID:           "ORD-003",
			CustomerName: "Bob Johnson",
			Products: []model.OrderProduct{
				{ProductID: "3", ProductName: "Wireless Headphones", Quantity: 1, Price: 199.99},
				{ProductID: "4", ProductName: "Smart Watch", Quantity: 1, Price: 349.99},
			},
			TotalAmount:     549.98,
			Status:          "pending",
			CreatedAt:       "2024-02-01T09:15:00Z",
			ShippingAddress: "789 Pine Rd, Village, Country",
		},
	}
	for _, o := range initialOrders {
		s.orders[o.ID] = o
	}
}

func (s *MemoryStore) GetAll() []model.Order {
	s.RLock()
	defer s.RUnlock()
	res := make([]model.Order, 0, len(s.orders))
	for _, o := range s.orders {
		res = append(res, o)
	}
	return res
}

func (s *MemoryStore) GetByID(id string) (model.Order, bool) {
	s.RLock()
	defer s.RUnlock()
	o, ok := s.orders[id]
	return o, ok
}

func (s *MemoryStore) UpdateStatus(id, status string) (model.Order, bool) {
	s.Lock()
	defer s.Unlock()
	o, ok := s.orders[id]
	if !ok {
		return model.Order{}, false
	}
	o.Status = status
	s.orders[id] = o
	return o, true
}
