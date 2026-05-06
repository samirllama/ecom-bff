package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/samirllama/ecom-bff/user-service/internal/handler"
	"github.com/samirllama/ecom-bff/user-service/internal/service"
	"github.com/samirllama/ecom-bff/user-service/internal/store"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	s := store.NewPostgresStore(dbURL)
	svc := service.NewUserService(s)
	h := handler.NewUserHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /users/active-count", h.ActiveCount)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3004"
	}

	fmt.Printf("User service listening on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
