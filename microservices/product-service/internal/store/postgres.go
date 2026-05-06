package store

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/samirllama/ecom-bff/product-service/internal/model"
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

func (s *PostgresStore) GetAll() []model.Product {
	rows, err := s.db.Query("SELECT id, name, price, stock, category, sales_count, revenue, image FROM products")
	if err != nil {
		log.Printf("Error querying products: %v\n", err)
		return []model.Product{}
	}
	defer rows.Close()

	var products []model.Product
	for rows.Next() {
		var p model.Product
		err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Category, &p.SalesCount, &p.Revenue, &p.Image)
		if err != nil {
			log.Printf("Error scanning product: %v\n", err)
			continue
		}
		products = append(products, p)
	}
	return products
}

func (s *PostgresStore) GetByID(id string) (model.Product, bool) {
	var p model.Product
	err := s.db.QueryRow("SELECT id, name, price, stock, category, sales_count, revenue, image FROM products WHERE id = $1", id).
		Scan(&p.ID, &p.Name, &p.Price, &p.Stock, &p.Category, &p.SalesCount, &p.Revenue, &p.Image)

	if err == sql.ErrNoRows {
		return model.Product{}, false
	}
	if err != nil {
		log.Printf("Error querying product %s: %v\n", id, err)
		return model.Product{}, false
	}
	return p, true
}
