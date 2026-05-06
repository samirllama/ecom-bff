// microservices/order-service/src/server.ts
import express from 'express';

const app = express();
app.use(express.json());

const orders = [
    {
        id: 'ORD-001',
        customerName: 'John Doe',
        products: [
            { productId: '1', productName: 'Laptop Pro', quantity: 1, price: 1299.99 }
        ],
        totalAmount: 1299.99,
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        shippingAddress: '123 Main St, City, Country',
    },
    {
        id: 'ORD-002',
        customerName: 'Jane Smith',
        products: [
            { productId: '2', productName: 'Smartphone X', quantity: 2, price: 899.99 }
        ],
        totalAmount: 1799.98,
        status: 'processing',
        createdAt: '2024-01-20T14:20:00Z',
        shippingAddress: '456 Oak Ave, Town, Country',
    },
    {
        id: 'ORD-003',
        customerName: 'Bob Johnson',
        products: [
            { productId: '3', productName: 'Wireless Headphones', quantity: 1, price: 199.99 },
            { productId: '4', productName: 'Smart Watch', quantity: 1, price: 349.99 }
        ],
        totalAmount: 549.98,
        status: 'pending',
        createdAt: '2024-02-01T09:15:00Z',
        shippingAddress: '789 Pine Rd, Village, Country',
    },
];

// Revenue data for the last 30 days
const generateRevenueData = () => {
    const data = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 5000) + 1000,
            orderCount: Math.floor(Math.random() * 20) + 5,
        });
    }
    return data;
};

// GET /orders/count
app.get('/orders/count', (req, res) => {
    res.json({ count: orders.length });
});

// GET /orders/recent
app.get('/orders/recent', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    res.json(recentOrders);
});

// GET /orders/revenue
app.get('/orders/revenue', (req, res) => {
    const revenueData = generateRevenueData();
    res.json(revenueData);
});

// GET /orders
app.get('/orders', (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    let filteredOrders = orders;

    if (status) {
        filteredOrders = orders.filter(o => o.status === status);
    }

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);

    res.json({
        orders: filteredOrders.slice(start, end),
        total: filteredOrders.length,
        page: Number(page),
        totalPages: Math.ceil(filteredOrders.length / Number(limit)),
    });
});

// GET /orders/:id
app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
});

// PATCH /orders/:id/status
app.patch('/orders/:id/status', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    order.status = req.body.status;
    res.json(order);
});

app.listen(3003, () => {
    console.log('Order Service running on port 3003');
});
