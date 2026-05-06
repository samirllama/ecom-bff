package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/samirllama/ecom-bff/product-service/internal/handler"
	"github.com/samirllama/ecom-bff/product-service/internal/service"
	"github.com/samirllama/ecom-bff/product-service/internal/store"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	s := store.NewPostgresStore(dbURL)
	svc := service.NewProductService(s)
	h := handler.NewProductHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /products/count", h.Count)
	mux.HandleFunc("GET /products/top", h.Top)
	mux.HandleFunc("GET /products", h.List)
	mux.HandleFunc("GET /products/{id}", h.GetByID)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3002"
	}

	fmt.Printf("Product service listening on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
