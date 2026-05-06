package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/samirllama/ecom-bff/order-service/internal/handler"
	"github.com/samirllama/ecom-bff/order-service/internal/model"
	"github.com/samirllama/ecom-bff/order-service/internal/service"
	"github.com/samirllama/ecom-bff/order-service/internal/store"
)

func TestOrderAPI(t *testing.T) {
	// Setup
	s := store.NewMemoryStore()
	svc := service.NewOrderService(s)
	h := handler.NewOrderHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /orders/count", h.Count)
	mux.HandleFunc("GET /orders/recent", h.Recent)
	mux.HandleFunc("PATCH /orders/{id}/status", h.UpdateStatus)

	ts := httptest.NewServer(mux)
	defer ts.Close()

	t.Run("GET /orders/count", func(t *testing.T) {
		res, err := http.Get(ts.URL + "/orders/count")
		if err != nil {
			t.Fatal(err)
		}
		var data map[string]int
		json.NewDecoder(res.Body).Decode(&data)
		if data["count"] != 3 {
			t.Errorf("expected count 3, got %d", data["count"])
		}
	})

	t.Run("GET /orders/recent", func(t *testing.T) {
		res, err := http.Get(ts.URL + "/orders/recent?limit=1")
		if err != nil {
			t.Fatal(err)
		}
		var orders []model.Order
		json.NewDecoder(res.Body).Decode(&orders)
		if len(orders) != 1 {
			t.Errorf("expected 1 order, got %d", len(orders))
		}
		// ORD-003 is the most recent (Feb 2024 vs Jan 2024)
		if orders[0].ID != "ORD-003" {
			t.Errorf("expected 'ORD-003', got '%s'", orders[0].ID)
		}
	})

	t.Run("PATCH /orders/ORD-001/status", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{"status": "shipped"})
		req, _ := http.NewRequest(http.MethodPatch, ts.URL+"/orders/ORD-001/status", bytes.NewBuffer(body))
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatal(err)
		}

		if res.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", res.StatusCode)
		}

		var order model.Order
		json.NewDecoder(res.Body).Decode(&order)
		if order.Status != "shipped" {
			t.Errorf("expected status 'shipped', got '%s'", order.Status)
		}
	})
}
