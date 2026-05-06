// microservices/product-service/src/server.ts
import express from 'express';

const app = express();
app.use(express.json());

const products = [
    { id: '1', name: 'Laptop Pro', price: 1299.99, stock: 50, category: 'Electronics', salesCount: 150, revenue: 194998.50, image: 'laptop.jpg' },
    { id: '2', name: 'Smartphone X', price: 899.99, stock: 100, category: 'Electronics', salesCount: 200, revenue: 179998.00, image: 'phone.jpg' },
    { id: '3', name: 'Wireless Headphones', price: 199.99, stock: 200, category: 'Accessories', salesCount: 300, revenue: 59997.00, image: 'headphones.jpg' },
    { id: '4', name: 'Smart Watch', price: 349.99, stock: 75, category: 'Wearables', salesCount: 120, revenue: 41998.80, image: 'watch.jpg' },
    { id: '5', name: 'Tablet Air', price: 599.99, stock: 60, category: 'Electronics', salesCount: 90, revenue: 53999.10, image: 'tablet.jpg' },
];

// GET /products/count
app.get('/products/count', (req, res) => {
    res.json({ count: products.length });
});

// GET /products/top
app.get('/products/top', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const topProducts = [...products]
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, limit);
    res.json(topProducts);
});

// GET /products
app.get('/products', (req, res) => {
    const { category, page = 1, limit = 10 } = req.query;
    let filteredProducts = products;

    if (category) {
        filteredProducts = products.filter(p => p.category === category);
    }

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);

    res.json({
        products: filteredProducts.slice(start, end),
        total: filteredProducts.length,
        page: Number(page),
        totalPages: Math.ceil(filteredProducts.length / Number(limit)),
    });
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

app.listen(3002, () => {
    console.log('Product Service running on port 3002');
});
