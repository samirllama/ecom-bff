package store

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
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

func (s *PostgresStore) GetActiveCount() int {
	var count int
	err := s.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Printf("Error querying user count: %v\n", err)
		return 0
	}
	// Mimic the mock behavior of adding 128 to the real count
	return 128 + count
}
