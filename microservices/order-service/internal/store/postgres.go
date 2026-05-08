package store

import (
	"database/sql"
	"fmt"
	"math"

	_ "github.com/lib/pq"
	"github.com/samirllama/ecom-bff/order-service/internal/model"
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

func (s *PostgresStore) GetOrderCount() (int, error) {
	var count int
	err := s.db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&count)
	return count, err
}

func (s *PostgresStore) GetRecentOrders(limit int) ([]model.Order, error) {
	rows, err := s.db.Query("SELECT id, customer_name, total_amount, status, COALESCE(shipping_address,''), created_at FROM orders ORDER BY created_at DESC LIMIT $1", limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.Order
	for rows.Next() {
		var o model.Order
		if err := rows.Scan(&o.ID, &o.CustomerName, &o.TotalAmount, &o.Status, &o.ShippingAddress, &o.CreatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, rows.Err()
}

func (s *PostgresStore) GetRevenueData(days int) ([]model.RevenueItem, error) {
	rows, err := s.db.Query(`
		SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
		       COALESCE(SUM(total_amount),0) as revenue,
		       COUNT(*) as orders
		FROM orders
		WHERE created_at >= CURRENT_DATE - $1::integer
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at) ASC`, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.RevenueItem
	for rows.Next() {
		var item model.RevenueItem
		if err := rows.Scan(&item.Date, &item.Revenue, &item.OrderCount); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *PostgresStore) GetOrders(page, limit int, filters map[string]interface{}) (*model.OrdersResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	// For now, filters are ignored. Extend later as needed.
	var total int
	err := s.db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&total)
	if err != nil {
		return nil, err
	}

	offset := (page - 1) * limit
	rows, err := s.db.Query(
		"SELECT id, customer_name, total_amount, status, COALESCE(shipping_address,''), created_at FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2",
		limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []model.Order
	for rows.Next() {
		var o model.Order
		if err := rows.Scan(&o.ID, &o.CustomerName, &o.TotalAmount, &o.Status, &o.ShippingAddress, &o.CreatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return &model.OrdersResponse{
		Orders:     orders,
		Total:      total,
		Page:       page,
		TotalPages: totalPages,
	}, nil
}

func (s *PostgresStore) GetOrderByID(id string) (model.Order, bool, error) {
	var o model.Order
	err := s.db.QueryRow("SELECT id, customer_name, total_amount, status, COALESCE(shipping_address,''), created_at FROM orders WHERE id=$1", id).
		Scan(&o.ID, &o.CustomerName, &o.TotalAmount, &o.Status, &o.ShippingAddress, &o.CreatedAt)
	if err == sql.ErrNoRows {
		return o, false, nil
	}
	if err != nil {
		return o, false, err
	}
	return o, true, nil
}

func (s *PostgresStore) UpdateOrderStatus(id, status string) (model.Order, error) {
	var o model.Order
	err := s.db.QueryRow("UPDATE orders SET status=$1 WHERE id=$2 RETURNING id, customer_name, total_amount, status, COALESCE(shipping_address,''), created_at", status, id).
		Scan(&o.ID, &o.CustomerName, &o.TotalAmount, &o.Status, &o.ShippingAddress, &o.CreatedAt)
	if err != nil {
		return o, err
	}
	return o, nil
}
