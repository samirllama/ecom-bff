package service

import (
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
	c, err := s.store.GetOrderCount()
	if err != nil {
		return 0
	}
	return c
}

func (s *OrderService) GetRecentOrders(limit int) []model.Order {
	orders, err := s.store.GetRecentOrders(limit)
	if err != nil {
		return []model.Order{}
	}
	return orders
}

func (s *OrderService) GetRevenueData(days int) []model.RevenueItem {
	data, err := s.store.GetRevenueData(days)
	if err != nil {
		return []model.RevenueItem{}
	}
	return data
}

func (s *OrderService) GetOrders(page, limit int) *model.OrdersResponse {
	resp, err := s.store.GetOrders(page, limit, nil)
	if err != nil {
		return &model.OrdersResponse{Orders: []model.Order{}, Total: 0, Page: page, TotalPages: 0}
	}
	return resp
}

func (s *OrderService) GetOrderByID(id string) (model.Order, bool) {
	order, found, err := s.store.GetOrderByID(id)
	if err != nil || !found {
		return model.Order{}, false
	}
	return order, true
}

func (s *OrderService) UpdateOrderStatus(id, status string) (model.Order, error) {
	return s.store.UpdateOrderStatus(id, status)
}
