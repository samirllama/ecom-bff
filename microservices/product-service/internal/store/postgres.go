package store

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
	"github.com/samirllama/ecom-bff/product-service/internal/model"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open db: %w", err)
	}
	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping db: %w", err)
	}
	return &PostgresStore{db: db}, nil
}

func (s *PostgresStore) Close() error {
	return s.db.Close()
}

func (s *PostgresStore) GetAll() ([]model.Product, error) {
	rows, err := s.db.Query("SELECT id, name, price, stock, category, sales_count, revenue, COALESCE(image,''), COALESCE(description,'') FROM products")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []model.Product
	for rows.Next() {
		var p model.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Category, &p.SalesCount, &p.Revenue, &p.Image, &p.Description); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

func (s *PostgresStore) GetByID(id string) (model.Product, bool, error) {
	var p model.Product
	err := s.db.QueryRow("SELECT id, name, price, stock, category, sales_count, revenue, COALESCE(image,''), COALESCE(description,'') FROM products WHERE id=$1", id).
		Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Category, &p.SalesCount, &p.Revenue, &p.Image, &p.Description)
	if err == sql.ErrNoRows {
		return p, false, nil
	}
	if err != nil {
		return p, false, err
	}
	return p, true, nil
}

func (s *PostgresStore) GetCount() (int, error) {
	var count int
	err := s.db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	return count, err
}

func (s *PostgresStore) GetTop(limit int) ([]model.Product, error) {
	rows, err := s.db.Query("SELECT id, name, price, stock, category, sales_count, revenue, COALESCE(image,''), COALESCE(description,'') FROM products ORDER BY sales_count DESC LIMIT $1", limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []model.Product
	for rows.Next() {
		var p model.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Category, &p.SalesCount, &p.Revenue, &p.Image, &p.Description); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

func (s *PostgresStore) List(category string, page, limit int) ([]model.Product, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	// Total count
	var total int
	queryTotal := "SELECT COUNT(*) FROM products"
	var args []interface{}
	if category != "" {
		queryTotal += " WHERE category = $1"
		args = append(args, category)
	}
	err := s.db.QueryRow(queryTotal, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	query := "SELECT id, name, price, stock, category, sales_count, revenue, COALESCE(image,''), COALESCE(description,'') FROM products"
	params := []interface{}{}
	if category != "" {
		query += " WHERE category = $1"
		params = append(params, category)
	}
	query += fmt.Sprintf(" ORDER BY id LIMIT $%d OFFSET $%d", len(params)+1, len(params)+2)
	params = append(params, limit, offset)

	rows, err := s.db.Query(query, params...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []model.Product
	for rows.Next() {
		var p model.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Category, &p.SalesCount, &p.Revenue, &p.Image, &p.Description); err != nil {
			return nil, 0, err
		}
		products = append(products, p)
	}
	return products, total, rows.Err()
}
