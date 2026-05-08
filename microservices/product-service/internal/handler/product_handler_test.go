package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/samirllama/ecom-bff/product-service/internal/model"
	"github.com/samirllama/ecom-bff/product-service/internal/service"
)

// mockStore implements store.Store for testing
type mockStore struct {
	count    int
	products map[string]model.Product
}

func newMockStore() *mockStore {
	return &mockStore{
		count:    0,
		products: make(map[string]model.Product),
	}
}

func (m *mockStore) GetAll() ([]model.Product, error) {
	var list []model.Product
	for _, p := range m.products {
		list = append(list, p)
	}
	return list, nil
}

func (m *mockStore) GetByID(id string) (model.Product, bool, error) {
	p, ok := m.products[id]
	return p, ok, nil
}

func (m *mockStore) GetCount() (int, error) {
	return len(m.products), nil
}

func (m *mockStore) GetTop(limit int) ([]model.Product, error) {
	// simplified: return first 'limit' products
	var list []model.Product
	for _, p := range m.products {
		if len(list) >= limit {
			break
		}
		list = append(list, p)
	}
	return list, nil
}

func (m *mockStore) List(category string, page, limit int) ([]model.Product, int, error) {
	var filtered []model.Product
	for _, p := range m.products {
		if category == "" || p.Category == category {
			filtered = append(filtered, p)
		}
	}
	total := len(filtered)
	start := (page - 1) * limit
	if start > total {
		start = total
	}
	end := start + limit
	if end > total {
		end = total
	}
	return filtered[start:end], total, nil
}

func TestCountHandler(t *testing.T) {
	mock := newMockStore()
	mock.products["1"] = model.Product{ID: "1", Name: "Test", SalesCount: 10}
	svc := service.NewProductService(mock)
	h := NewProductHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/products/count", nil)
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

func TestTopHandler(t *testing.T) {
	mock := newMockStore()
	mock.products["1"] = model.Product{ID: "1", Name: "A", SalesCount: 100}
	mock.products["2"] = model.Product{ID: "2", Name: "B", SalesCount: 50}
	svc := service.NewProductService(mock)
	h := NewProductHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/products/top?limit=2", nil)
	w := httptest.NewRecorder()
	h.Top(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var products []model.Product
	if err := json.NewDecoder(w.Body).Decode(&products); err != nil {
		t.Fatal(err)
	}
	if len(products) != 2 {
		t.Fatalf("expected 2 products, got %d", len(products))
	}
}

func TestListHandler(t *testing.T) {
	mock := newMockStore()
	mock.products["1"] = model.Product{ID: "1", Name: "A", Category: "cat"}
	mock.products["2"] = model.Product{ID: "2", Name: "B", Category: "cat"}
	svc := service.NewProductService(mock)
	h := NewProductHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/products?page=1&limit=10", nil)
	w := httptest.NewRecorder()
	h.List(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var resp ProductsResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatal(err)
	}
	if resp.Total != 2 {
		t.Errorf("total = %d, want 2", resp.Total)
	}
}

func TestGetByIDHandler_Found(t *testing.T) {
	mock := newMockStore()
	mock.products["id-1"] = model.Product{ID: "id-1", Name: "Found"}
	svc := service.NewProductService(mock)
	h := NewProductHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/products/id-1", nil)
	req.SetPathValue("id", "id-1")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var p model.Product
	if err := json.NewDecoder(w.Body).Decode(&p); err != nil {
		t.Fatal(err)
	}
	if p.Name != "Found" {
		t.Errorf("name = %q, want %q", p.Name, "Found")
	}
}

func TestGetByIDHandler_NotFound(t *testing.T) {
	mock := newMockStore()
	svc := service.NewProductService(mock)
	h := NewProductHandler(svc)

	req := httptest.NewRequest(http.MethodGet, "/products/none", nil)
	req.SetPathValue("id", "none")
	w := httptest.NewRecorder()
	h.GetByID(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}
