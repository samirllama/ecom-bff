package store

import "github.com/samirllama/ecom-bff/product-service/internal/model"

type Store interface {
	GetAll() ([]model.Product, error)
	GetByID(id string) (model.Product, bool, error)
	GetCount() (int, error)
	GetTop(limit int) ([]model.Product, error)
	List(category string, page, limit int) ([]model.Product, int, error) // returns products and total count
}
