package store

import "github.com/samirllama/ecom-bff/order-service/internal/model"

type Store interface {
	GetOrderCount() (int, error)
	GetRecentOrders(limit int) ([]model.Order, error)
	GetRevenueData(days int) ([]model.RevenueItem, error)
	GetOrders(page, limit int, filters map[string]interface{}) (*model.OrdersResponse, error)
	GetOrderByID(id string) (model.Order, bool, error)
	UpdateOrderStatus(id, status string) (model.Order, error)
}
