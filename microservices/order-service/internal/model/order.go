package model

type OrderProduct struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
}

type Order struct {
	ID              string         `json:"id"`
	CustomerName    string         `json:"customerName"`
	Products        []OrderProduct `json:"products"`
	TotalAmount     float64        `json:"totalAmount"`
	Status          string         `json:"status"`
	CreatedAt       string         `json:"createdAt"`
	ShippingAddress string         `json:"shippingAddress"`
}

type RevenueData struct {
	Date       string  `json:"date"`
	Revenue    float64 `json:"revenue"`
	OrderCount int     `json:"orderCount"`
}
