package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/samirllama/ecom-bff/order-service/internal/handler"
	"github.com/samirllama/ecom-bff/order-service/internal/service"
	"github.com/samirllama/ecom-bff/order-service/internal/store"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/ecommerce?sslmode=disable"
	}

	var pgStore *store.PostgresStore
	var err error
	for i := 0; i < 10; i++ {
		pgStore, err = store.NewPostgresStore(dbURL)
		if err == nil {
			log.Println("Connected to database")
			break
		}
		log.Printf("Attempt %d: unable to connect to database: %v", i+1, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("Unable to connect to database after 10 attempts: %v", err)
	}
	defer pgStore.Close()

	svc := service.NewOrderService(pgStore)
	h := handler.NewOrderHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("/orders/count", h.Count)
	mux.HandleFunc("/orders/recent", h.Recent)
	mux.HandleFunc("/orders/revenue", h.Revenue)
	mux.HandleFunc("/orders", h.List)
	mux.HandleFunc("/orders/{id}", h.GetByID)
	mux.HandleFunc("/orders/{id}/status", h.UpdateStatus)

	port := "3003"
	log.Printf("Order service listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
