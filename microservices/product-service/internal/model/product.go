package model

type Product struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	Category    string  `json:"category"`
	SalesCount  int     `json:"salesCount"`
	Revenue     float64 `json:"revenue"`
	Image       string  `json:"image,omitempty"`
	Description string  `json:"description,omitempty"`
}
