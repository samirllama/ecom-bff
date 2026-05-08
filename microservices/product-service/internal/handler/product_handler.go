package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/samirllama/ecom-bff/product-service/internal/model"
	"github.com/samirllama/ecom-bff/product-service/internal/service"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(s *service.ProductService) *ProductHandler {
	return &ProductHandler{service: s}
}

func (h *ProductHandler) Count(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int{"count": h.service.GetCount()})
}

func (h *ProductHandler) Top(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	limit := 5
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(h.service.GetTop(limit))
}

type ProductsResponse struct {
	Products   []model.Product `json:"products"`
	Total      int             `json:"total"`
	Page       int             `json:"page"`
	TotalPages int             `json:"totalPages"`
}

func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, _ := strconv.Atoi(pageStr)
	if page <= 0 {
		page = 1
	}
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 10
	}

	products, total := h.service.List(category, page, limit)
	totalPages := (total + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}

	resp := ProductsResponse{
		Products:   products,
		Total:      total,
		Page:       page,
		TotalPages: totalPages,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *ProductHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	p, ok := h.service.GetByID(id)
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Product not found"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}
