package store

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/samirllama/ecom-bff/order-service/internal/model"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(databaseURL string) *PostgresStore {
	var db *sql.DB
	var err error

	for i := 0; i < 10; i++ {
		db, err = sql.Open("pgx", databaseURL)
		if err == nil {
			if err = db.Ping(); err == nil {
				return &PostgresStore{db: db}
			}
		}
		log.Printf("Failed to connect to database, retrying in 2s... (%d/10)\n", i+1)
		time.Sleep(2 * time.Second)
	}

	log.Fatalf("Unable to connect to database after 10 attempts: %v\n", err)
	return nil
}

func (s *PostgresStore) GetAll() []model.Order {
	rows, err := s.db.Query("SELECT id, customer_name, total_amount, status, shipping_address, created_at FROM orders")
	if err != nil {
		log.Printf("Error querying orders: %v\n", err)
		return []model.Order{}
	}
	defer rows.Close()

	var orders []model.Order
	for rows.Next() {
		var o model.Order
		var createdAt sql.NullTime
		err := rows.Scan(&o.ID, &o.CustomerName, &o.TotalAmount, &o.Status, &o.ShippingAddress, &createdAt)
		if err != nil {
			log.Printf("Error scanning order: %v\n", err)
			continue
		}
		if createdAt.Valid {
			o.CreatedAt = createdAt.Time.Format("2006-01-02T15:04:05Z")
		}
		o.Products = s.getOrderItems(o.ID)
		orders = append(orders, o)
	}
	return orders
}

func (s *PostgresStore) getOrderItems(orderID string) []model.OrderProduct {
	rows, err := s.db.Query("SELECT product_id, product_name, quantity, price FROM order_items WHERE order_id = $1", orderID)
	if err != nil {
		log.Printf("Error querying order items for %s: %v\n", orderID, err)
		return []model.OrderProduct{}
	}
	defer rows.Close()

	var items []model.OrderProduct
	for rows.Next() {
		var i model.OrderProduct
		err := rows.Scan(&i.ProductID, &i.ProductName, &i.Quantity, &i.Price)
		if err != nil {
			log.Printf("Error scanning order item: %v\n", err)
			continue
		}
		items = append(items, i)
	}
	return items
}

func (s *PostgresStore) GetByID(id string) (model.Order, bool) {
	var o model.Order
	var createdAt sql.NullTime
	err := s.db.QueryRow("SELECT id, customer_name, total_amount, status, shipping_address, created_at FROM orders WHERE id = $1", id).
		Scan(&o.ID, &o.CustomerName, &o.TotalAmount, &o.Status, &o.ShippingAddress, &createdAt)

	if err == sql.ErrNoRows {
		return model.Order{}, false
	}
	if err != nil {
		log.Printf("Error querying order %s: %v\n", id, err)
		return model.Order{}, false
	}
	if createdAt.Valid {
		o.CreatedAt = createdAt.Time.Format("2006-01-02T15:04:05Z")
	}
	o.Products = s.getOrderItems(o.ID)
	return o, true
}

func (s *PostgresStore) UpdateStatus(id, status string) (model.Order, bool) {
	_, err := s.db.Exec("UPDATE orders SET status = $1 WHERE id = $2", status, id)
	if err != nil {
		log.Printf("Error updating order %s status: %v\n", id, err)
		return model.Order{}, false
	}
	return s.GetByID(id)
}
