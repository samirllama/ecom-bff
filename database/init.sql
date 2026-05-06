-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    category TEXT NOT NULL,
    sales_count INTEGER DEFAULT 0,
    revenue DECIMAL(15, 2) DEFAULT 0,
    image TEXT
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    status TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table (Snapshot of product data at time of order)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Seed Data
-- Products
INSERT INTO products (id, name, price, stock, category, sales_count, revenue, image) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Laptop Pro', 1299.99, 50, 'Electronics', 150, 194998.50, 'laptop.jpg'),
('550e8400-e29b-41d4-a716-446655440002', 'Smartphone X', 899.99, 100, 'Electronics', 200, 179998.00, 'phone.jpg'),
('550e8400-e29b-41d4-a716-446655440003', 'Wireless Headphones', 199.99, 200, 'Accessories', 300, 59997.00, 'headphones.jpg'),
('550e8400-e29b-41d4-a716-446655440004', 'Smart Watch', 349.99, 75, 'Wearables', 120, 41998.80, 'watch.jpg'),
('550e8400-e29b-41d4-a716-446655440005', 'Tablet Air', 599.99, 60, 'Electronics', 90, 53999.10, 'tablet.jpg');

-- Users
INSERT INTO users (id, email, role) VALUES
('550e8400-e29b-41d4-a716-446655442001', 'admin@example.com', 'admin'),
('550e8400-e29b-41d4-a716-446655442002', 'user1@example.com', 'user');

-- Orders
INSERT INTO orders (id, customer_name, total_amount, status, shipping_address, created_at) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'John Doe', 1299.99, 'completed', '123 Main St, City, Country', '2024-01-15T10:30:00Z'),
('550e8400-e29b-41d4-a716-446655441002', 'Jane Smith', 1799.98, 'processing', '456 Oak Ave, Town, Country', '2024-01-20T14:20:00Z'),
('550e8400-e29b-41d4-a716-446655441003', 'Bob Johnson', 549.98, 'pending', '789 Pine Rd, Village, Country', '2024-02-01T09:15:00Z');

-- Order Items
INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES
('550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440001', 'Laptop Pro', 1, 1299.99),
('550e8400-e29b-41d4-a716-446655441002', '550e8400-e29b-41d4-a716-446655440002', 'Smartphone X', 2, 899.99),
('550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655440003', 'Wireless Headphones', 1, 199.99),
('550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655440004', 'Smart Watch', 1, 349.99);
