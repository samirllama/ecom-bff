package model

type Order struct {
	ID              string  `json:"id"`
	CustomerName    string  `json:"customerName"`
	TotalAmount     float64 `json:"totalAmount"`
	Status          string  `json:"status"`
	ShippingAddress string  `json:"shippingAddress"`
	CreatedAt       string  `json:"createdAt"`
}

type OrdersResponse struct {
	Orders     []Order `json:"orders"`
	Total      int     `json:"total"`
	Page       int     `json:"page"`
	TotalPages int     `json:"totalPages"`
}

type RevenueItem struct {
	Date       string  `json:"date"`
	Revenue    float64 `json:"revenue"`
	OrderCount int     `json:"orderCount"`
}
