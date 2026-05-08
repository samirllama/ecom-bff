package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/samirllama/ecom-bff/order-service/internal/model"
	"github.com/samirllama/ecom-bff/order-service/internal/service"
)

type mockStore struct {
	orders  map[string]model.Order
	revenue []model.RevenueItem
}

func newMockStore() *mockStore {
	return &mockStore{
		orders: make(map[string]model.Order),
	}
}

func (m *mockStore) GetOrderCount() (int, error) {
	return len(m.orders), nil
}

func (m *mockStore) GetRecentOrders(limit int) ([]model.Order, error) {
	var list []model.Order
	for _, o := range m.orders {
		if len(list) >= limit {
			break
		}
		list = append(list, o)
	}
	return list, nil
}

func (m *mockStore) GetRevenueData(days int) ([]model.RevenueItem, error) {
	return m.revenue, nil
}

func (m *mockStore) GetOrders(page, limit int, filters map[string]interface{}) (*model.OrdersResponse, error) {
	var list []model.Order
	for _, o := range m.orders {
		list = append(list, o)
	}
	total := len(list)
	start := (page - 1) * limit
	if start > total {
		start = total
	}
	end := start + limit
	if end > total {
		end = total
	}
	totalPages := 0
	if total > 0 {
		totalPages = (total + limit - 1) / limit
	}
	return &model.OrdersResponse{
		Orders:     list[start:end],
		Total:      total,
		Page:       page,
		TotalPages: totalPages,
	}, nil
}

func (m *mockStore) GetOrderByID(id string) (model.Order, bool, error) {
	o, ok := m.orders[id]
	return o, ok, nil
}

func (m *mockStore) UpdateOrderStatus(id, status string) (model.Order, error) {
	o := m.orders[id]
	o.Status = status
	m.orders[id] = o
	return o, nil
}

func TestOrderCountHandler(t *testing.T) {
	mock := newMockStore()
	mock.orders["1"] = model.Order{ID: "1"}
	svc := service.NewOrderService(mock)
	h := NewOrderHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/orders/count", nil)
	w := httptest.NewRecorder()
	h.Count(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var resp map[string]int
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if resp["count"] != 1 {
		t.Errorf("count = %d, want 1", resp["count"])
	}
}

func TestRecentOrdersHandler(t *testing.T) {
	mock := newMockStore()
	mock.orders["1"] = model.Order{ID: "1", CustomerName: "John"}
	mock.orders["2"] = model.Order{ID: "2", CustomerName: "Jane"}
	svc := service.NewOrderService(mock)
	h := NewOrderHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/orders/recent?limit=2", nil)
	w := httptest.NewRecorder()
	h.Recent(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var orders []model.Order
	if err := json.NewDecoder(w.Body).Decode(&orders); err != nil {
		t.Fatal(err)
	}
	if len(orders) != 2 {
		t.Fatalf("expected 2 orders, got %d", len(orders))
	}
}

func TestRevenueHandler(t *testing.T) {
	mock := newMockStore()
	mock.revenue = []model.RevenueItem{
		{Date: "2024-01-01", Revenue: 100.0, OrderCount: 3},
	}
	svc := service.NewOrderService(mock)
	h := NewOrderHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/orders/revenue?days=30", nil)
	w := httptest.NewRecorder()
	h.Revenue(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var items []model.RevenueItem
	if err := json.NewDecoder(w.Body).Decode(&items); err != nil {
		t.Fatal(err)
	}
	if len(items) != 1 || items[0].Revenue != 100.0 {
		t.Errorf("unexpected revenue data: %+v", items)
	}
}

func TestOrderListHandler(t *testing.T) {
	mock := newMockStore()
	mock.orders["1"] = model.Order{ID: "1"}
	mock.orders["2"] = model.Order{ID: "2"}
	svc := service.NewOrderService(mock)
	h := NewOrderHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/orders?page=1&limit=10", nil)
	w := httptest.NewRecorder()
	h.List(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var resp model.OrdersResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if resp.Total != 2 {
		t.Errorf("total = %d, want 2", resp.Total)
	}
}

func TestGetOrderByID_Found(t *testing.T) {
	mock := newMockStore()
	mock.orders["id-1"] = model.Order{ID: "id-1", CustomerName: "Alice"}
	svc := service.NewOrderService(mock)
	h := NewOrderHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/orders/id-1", nil)
	req.SetPathValue("id", "id-1")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var o model.Order
	if err := json.NewDecoder(w.Body).Decode(&o); err != nil {
		t.Fatal(err)
	}
	if o.CustomerName != "Alice" {
		t.Errorf("customer = %q, want Alice", o.CustomerName)
	}
}

func TestGetOrderByID_NotFound(t *testing.T) {
	mock := newMockStore()
	svc := service.NewOrderService(mock)
	h := NewOrderHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/orders/nonexistent", nil)
	req.SetPathValue("id", "nonexistent")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}
