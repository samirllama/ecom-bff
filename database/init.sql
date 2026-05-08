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
    description TEXT
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
INSERT INTO products (id, name, price, stock, category, sales_count, revenue, description, image) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Wireless Noise-Cancelling Headphones', 299.99, 25, 'Electronics', 120, 35998.80, 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.', '/images/products/headphones.jpg'),
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Organic Cotton T-Shirt', 29.99, 150, 'Apparel', 340, 10196.60, 'Soft, breathable 100% organic cotton tee. Available in multiple colors.', '/images/products/tshirt.jpg'),
('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Stainless Steel Water Bottle', 24.95, 80, 'Accessories', 210, 5249.50, 'Double-wall vacuum insulated, keeps drinks cold 24h or hot 12h.', '/images/products/bottle.jpg'),
('a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Bluetooth Portable Speaker', 79.00, 40, 'Electronics', 95, 7505.00, 'Compact waterproof speaker with 360° sound and 12h playtime.', '/images/products/speaker.jpg'),
('a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Running Shoes - Ultralight', 129.99, 60, 'Footwear', 188, 24438.12, 'Lightweight mesh upper with responsive cushioning for daily runs.', '/images/products/shoes.jpg'),
('a5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Ceramic Coffee Mug Set (4 pcs)', 39.99, 100, 'Home & Kitchen', 78, 3119.22, 'Hand-glazed ceramic mugs, microwave and dishwasher safe.', '/images/products/mugset.jpg'),
('a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Yoga Mat - Extra Thick', 45.00, 55, 'Fitness', 142, 6390.00, 'Non-slip, 6mm thick mat with carrying strap. Ideal for yoga and pilates.', '/images/products/yogamat.jpg'),
('a7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'USB-C Hub 7-in-1', 59.99, 35, 'Electronics', 86, 5159.14, 'Aluminum adapter with HDMI, USB-A, USB-C PD, SD/microSD slots.', '/images/products/hub.jpg'),
('a8eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Desk LED Lamp with Wireless Charger', 89.99, 20, 'Office', 62, 5579.38, 'Adjustable brightness and color temperature, built-in Qi charger.', '/images/products/ledlamp.jpg'),
('a9eebc99-9c0b-4ef8-bb6d-6bb9bd380a1a', 'Hiking Backpack 40L', 110.00, 30, 'Outdoor', 55, 6050.00, 'Water-resistant ripstop nylon with hydration sleeve and rain cover.', '/images/products/backpack.jpg'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a1b', 'Sunglasses - Polarized Aviator', 65.00, 45, 'Accessories', 220, 14300.00, 'UV400 protection, lightweight metal frame, classic aviator style.', '/images/products/sunglasses.jpg'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a1c', 'Plant-Based Protein Powder', 49.95, 75, 'Health', 90, 4495.50, 'Organic pea and brown rice blend, 24g protein per serving, vanilla.', '/images/products/protein.jpg'),
('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a1d', 'Mechanical Keyboard - 65%', 149.99, 18, 'Gaming', 73, 10949.27, 'Hot-swappable switches, PBT keycaps, RGB backlighting.', '/images/products/keyboard.jpg'),
('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a1e', 'Cotton Hoodie Unisex', 54.99, 120, 'Apparel', 155, 8523.45, 'Heavyweight fleece-lined hoodie with adjustable drawcord.', '/images/products/hoodie.jpg'),
('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a1f', 'Smart Watering System', 99.99, 12, 'Home & Garden', 32, 3199.68, 'WiFi-enabled irrigation controller with weather adaptation.', '/images/products/watering.jpg'),
('b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Travel Laptop Stand', 34.50, 65, 'Office', 41, 1414.50, 'Foldable aluminum stand, elevates laptop to eye level, fits 10-16″.', '/images/products/laptopstand.jpg'),
('b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Insulated Lunch Bag', 22.99, 85, 'Accessories', 64, 1471.36, 'Leak-proof, spacious interior, keeps food fresh for hours.', '/images/products/lunchbag.jpg'),
('b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Smart Body Scale', 49.00, 40, 'Health', 108, 5292.00, 'Measures weight, BMI, body fat, and syncs via Bluetooth to app.', '/images/products/scale.jpg'),
('b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Canvas Tote Bag', 19.99, 200, 'Accessories', 310, 6196.90, 'Durable cotton canvas with interior zip pocket, perfect for groceries.', '/images/products/tote.jpg'),
('b9eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'Resistance Bands Set', 29.99, 70, 'Fitness', 130, 3898.70, '5 levels of resistance, latex-free, includes door anchor and carrying bag.', '/images/products/bands.jpg');

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
