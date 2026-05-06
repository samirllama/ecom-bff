package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/samirllama/ecom-bff/order-service/internal/handler"
	"github.com/samirllama/ecom-bff/order-service/internal/service"
	"github.com/samirllama/ecom-bff/order-service/internal/store"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	s := store.NewPostgresStore(dbURL)
	svc := service.NewOrderService(s)
	h := handler.NewOrderHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /orders/count", h.Count)
	mux.HandleFunc("GET /orders/recent", h.Recent)
	mux.HandleFunc("GET /orders/revenue", h.Revenue)
	mux.HandleFunc("GET /orders", h.List)
	mux.HandleFunc("GET /orders/{id}", h.GetByID)
	mux.HandleFunc("PATCH /orders/{id}/status", h.UpdateStatus)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3003"
	}

	fmt.Printf("Order service listening on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
