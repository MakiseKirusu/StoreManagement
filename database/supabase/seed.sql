-- ============================================================
-- JStore Database Seed Data for Supabase PostgreSQL
-- ============================================================
-- This script inserts initial data needed for the application
-- Run this AFTER schema.sql
-- ============================================================

-- ============================================================
-- Insert Roles
-- ============================================================
INSERT INTO roles (name) VALUES
    ('ROLE_CUSTOMER'),
    ('ROLE_STAFF'),
    ('ROLE_ADMIN')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Insert Sample Categories
-- ============================================================
INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Clothing'),
    ('Books'),
    ('Home & Kitchen'),
    ('Sports & Outdoors'),
    ('Beauty & Personal Care'),
    ('Toys & Games'),
    ('Food & Beverages')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Insert Sample Admin User
-- ============================================================
-- Password is 'admin123' hashed with BCrypt
-- You should change this password immediately after first login
-- To generate a new BCrypt hash, use: https://bcrypt-generator.com/
-- Or use Spring Security's BCryptPasswordEncoder in Java

INSERT INTO users (username, password, email) VALUES
    ('admin', '$2a$10$X5wFWtE02o9qSZ8RJKz0TuKZDCc8u5X5/YD6wXRr5qH.GJqNQUO6G', 'admin@jstore.com')
ON CONFLICT (username) DO NOTHING;

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Insert Sample Customer User
-- ============================================================
-- Password is 'customer123' hashed with BCrypt
INSERT INTO users (username, password, email) VALUES
    ('customer', '$2a$10$nYQJj9F2sD8hMX0lKYpXvOmSjVQvHd3RvZJ8nRLR8gH9gT2pV.3uW', 'customer@jstore.com')
ON CONFLICT (username) DO NOTHING;

-- Assign CUSTOMER role to customer user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'customer' AND r.name = 'ROLE_CUSTOMER'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Insert Sample Products (Electronics)
-- ============================================================
DO $$
DECLARE
    electronics_id BIGINT;
    clothing_id BIGINT;
    books_id BIGINT;
    product_id BIGINT;
BEGIN
    -- Get category IDs
    SELECT id INTO electronics_id FROM categories WHERE name = 'Electronics';
    SELECT id INTO clothing_id FROM categories WHERE name = 'Clothing';
    SELECT id INTO books_id FROM categories WHERE name = 'Books';

    -- Electronics Products
    INSERT INTO products (name, description, price, image_url, category_id) VALUES
        ('iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip', 999.99, 'https://example.com/iphone15.jpg', electronics_id),
        ('Samsung Galaxy S24', 'Premium Android phone with AI features', 899.99, 'https://example.com/galaxy-s24.jpg', electronics_id),
        ('MacBook Pro 16"', 'Professional laptop with M3 Pro chip', 2499.99, 'https://example.com/macbook.jpg', electronics_id),
        ('Sony WH-1000XM5', 'Noise-cancelling wireless headphones', 399.99, 'https://example.com/sony-headphones.jpg', electronics_id),
        ('iPad Air', 'Powerful tablet for work and play', 599.99, 'https://example.com/ipad-air.jpg', electronics_id)
    ON CONFLICT DO NOTHING;

    -- Clothing Products
    INSERT INTO products (name, description, price, image_url, category_id) VALUES
        ('Levi''s 501 Jeans', 'Classic straight-fit denim jeans', 69.99, 'https://example.com/levis-jeans.jpg', clothing_id),
        ('Nike Air Max', 'Comfortable running shoes with air cushioning', 129.99, 'https://example.com/nike-airmax.jpg', clothing_id),
        ('Patagonia Fleece Jacket', 'Warm and eco-friendly outdoor jacket', 149.99, 'https://example.com/patagonia-jacket.jpg', clothing_id),
        ('Adidas Performance T-Shirt', 'Moisture-wicking athletic tee', 29.99, 'https://example.com/adidas-tshirt.jpg', clothing_id)
    ON CONFLICT DO NOTHING;

    -- Books
    INSERT INTO products (name, description, price, image_url, category_id) VALUES
        ('Clean Code', 'A Handbook of Agile Software Craftsmanship by Robert C. Martin', 39.99, 'https://example.com/clean-code.jpg', books_id),
        ('The Pragmatic Programmer', 'Your Journey To Mastery, 20th Anniversary Edition', 44.99, 'https://example.com/pragmatic-programmer.jpg', books_id),
        ('Designing Data-Intensive Applications', 'The Big Ideas Behind Reliable, Scalable Systems', 49.99, 'https://example.com/ddia.jpg', books_id)
    ON CONFLICT DO NOTHING;

    -- ============================================================
    -- Insert Inventory for all products
    -- ============================================================
    -- Set initial stock levels for all products
    INSERT INTO inventory (product_id, stock_quantity)
    SELECT id, FLOOR(RANDOM() * 100 + 20)::INTEGER -- Random stock between 20-120
    FROM products
    WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE inventory.product_id = products.id);

END $$;

-- ============================================================
-- Insert Sample Vouchers
-- ============================================================
INSERT INTO vouchers (code, type, value, min_spend, expiry_date) VALUES
    ('WELCOME10', 'PERCENT', 10, 50, CURRENT_DATE + INTERVAL '30 days'),
    ('SAVE20', 'FIXED', 20, 100, CURRENT_DATE + INTERVAL '60 days'),
    ('FREESHIP', 'FIXED', 5, 30, CURRENT_DATE + INTERVAL '90 days'),
    ('SUMMER25', 'PERCENT', 25, 150, CURRENT_DATE + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- Verify Seed Data
-- ============================================================
-- Check roles
SELECT 'Roles inserted:' as info, COUNT(*) as count FROM roles;

-- Check categories
SELECT 'Categories inserted:' as info, COUNT(*) as count FROM categories;

-- Check users
SELECT 'Users inserted:' as info, COUNT(*) as count FROM users;

-- Check products
SELECT 'Products inserted:' as info, COUNT(*) as count FROM products;

-- Check inventory
SELECT 'Inventory records:' as info, COUNT(*) as count FROM inventory;

-- Check vouchers
SELECT 'Vouchers inserted:' as info, COUNT(*) as count FROM vouchers;

-- ============================================================
-- Seed Data Complete
-- ============================================================
-- Default login credentials:
-- Admin: username=admin, password=admin123
-- Customer: username=customer, password=customer123
--
-- IMPORTANT: Change these passwords in production!
-- ============================================================
