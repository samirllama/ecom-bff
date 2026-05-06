package service

import (
	"math/rand"
	"sort"
	"time"

	"github.com/samirllama/ecom-bff/order-service/internal/model"
	"github.com/samirllama/ecom-bff/order-service/internal/store"
)

type OrderService struct {
	store store.Store
}

func NewOrderService(s store.Store) *OrderService {
	return &OrderService{store: s}
}

func (s *OrderService) GetCount() int {
	return len(s.store.GetAll())
}

func (s *OrderService) GetRecent(limit int) []model.Order {
	orders := s.store.GetAll()
	sort.Slice(orders, func(i, j int) bool {
		ti, _ := time.Parse(time.RFC3339, orders[i].CreatedAt)
		tj, _ := time.Parse(time.RFC3339, orders[j].CreatedAt)
		return tj.Before(ti)
	})

	if limit > len(orders) {
		limit = len(orders)
	}
	return orders[:limit]
}

func (s *OrderService) GetRevenueData() []model.RevenueData {
	data := []model.RevenueData{}
	now := time.Now()
	for i := 29; i >= 0; i-- {
		date := now.AddDate(0, 0, -i)
		data = append(data, model.RevenueData{
			Date:       date.Format("2006-01-02"),
			Revenue:    float64(rand.Intn(5000) + 1000),
			OrderCount: rand.Intn(20) + 5,
		})
	}
	return data
}

func (s *OrderService) List(status string, page, limit int) ([]model.Order, int) {
	all := s.store.GetAll()
	filtered := []model.Order{}
	for _, o := range all {
		if status == "" || o.Status == status {
			filtered = append(filtered, o)
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

func (s *OrderService) GetByID(id string) (model.Order, bool) {
	return s.store.GetByID(id)
}

func (s *OrderService) UpdateStatus(id, status string) (model.Order, bool) {
	return s.store.UpdateStatus(id, status)
}
