package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/samirllama/ecom-bff/product-service/internal/handler"
	"github.com/samirllama/ecom-bff/product-service/internal/model"
	"github.com/samirllama/ecom-bff/product-service/internal/service"
	"github.com/samirllama/ecom-bff/product-service/internal/store"
)

func TestProductAPI(t *testing.T) {
	// Setup
	s := store.NewMemoryStore()
	svc := service.NewProductService(s)
	h := handler.NewProductHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /products/count", h.Count)
	mux.HandleFunc("GET /products/top", h.Top)
	mux.HandleFunc("GET /products/{id}", h.GetByID)

	ts := httptest.NewServer(mux)
	defer ts.Close()

	t.Run("GET /products/count", func(t *testing.T) {
		res, err := http.Get(ts.URL + "/products/count")
		if err != nil {
			t.Fatal(err)
		}
		if res.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", res.StatusCode)
		}

		var data map[string]int
		json.NewDecoder(res.Body).Decode(&data)
		if data["count"] != 5 {
			t.Errorf("expected count 5, got %d", data["count"])
		}
	})

	t.Run("GET /products/top", func(t *testing.T) {
		res, err := http.Get(ts.URL + "/products/top?limit=1")
		if err != nil {
			t.Fatal(err)
		}

		var products []model.Product
		json.NewDecoder(res.Body).Decode(&products)

		if len(products) != 1 {
			t.Errorf("expected 1 product, got %d", len(products))
		}
		// Wireless Headphones has 300 salesCount (highest)
		if products[0].Name != "Wireless Headphones" {
			t.Errorf("expected 'Wireless Headphones', got '%s'", products[0].Name)
		}
	})

	t.Run("GET /products/1", func(t *testing.T) {
		res, err := http.Get(ts.URL + "/products/1")
		if err != nil {
			t.Fatal(err)
		}

		if res.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", res.StatusCode)
		}

		var product model.Product
		json.NewDecoder(res.Body).Decode(&product)
		if product.ID != "1" || product.Name != "Laptop Pro" {
			t.Errorf("unexpected product data: %+v", product)
		}
	})
}
