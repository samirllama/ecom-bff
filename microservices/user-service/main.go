package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/samirllama/ecom-bff/user-service/internal/handler"
	"github.com/samirllama/ecom-bff/user-service/internal/service"
	"github.com/samirllama/ecom-bff/user-service/internal/store"
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

	svc := service.NewUserService(pgStore)
	h := handler.NewUserHandler(svc)

	mux := http.NewServeMux()
	mux.HandleFunc("/users/active-count", h.ActiveCount)

	port := "3004"
	log.Printf("User service listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
