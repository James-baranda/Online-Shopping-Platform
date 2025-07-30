-- ShopHub E-Commerce Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS shophub_db;
USE shophub_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'USA',
    newsletter BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    avatar VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    parent_id INT,
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id),
    INDEX idx_active (active)
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    category_id INT,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    max_order_quantity INT,
    min_order_quantity INT DEFAULT 1,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    badge VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_brand (brand),
    INDEX idx_sku (sku),
    INDEX idx_featured (featured),
    INDEX idx_active (active),
    INDEX idx_price (price),
    INDEX idx_rating (rating)
);

-- Product images table
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_primary (is_primary)
);

-- Product variants table
CREATE TABLE product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    variant_value VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    sku VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_active (active)
);

-- Cart table
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(255),
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    variant_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_product (product_id)
);

-- Wishlist table
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, product_id),
    INDEX idx_user (user_id)
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    guest_email VARCHAR(100),
    guest_name VARCHAR(100),
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_transaction_id VARCHAR(255),
    shipping_method VARCHAR(100),
    shipping_tracking_number VARCHAR(255),
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    variant_id INT,
    variant_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY unique_review (product_id, user_id),
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status)
);

-- Coupons table
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    user_limit INT DEFAULT 1,
    valid_from DATETIME,
    valid_until DATETIME,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (active),
    INDEX idx_valid_until (valid_until)
);

-- Coupon usage table
CREATE TABLE coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_coupon (coupon_id),
    INDEX idx_user (user_id),
    INDEX idx_order (order_id)
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    status ENUM('subscribed', 'unsubscribed') DEFAULT 'subscribed',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Insert sample data

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Latest gadgets and technology products'),
('Fashion', 'fashion', 'Trendy clothing and accessories'),
('Home & Garden', 'home', 'Everything for your home and garden'),
('Sports & Fitness', 'sports', 'Sports equipment and fitness gear');

-- Insert sample products
INSERT INTO products (name, slug, description, price, category, brand, sku, stock_quantity, featured, badge, rating, review_count) VALUES
('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'High-quality wireless headphones with noise cancellation', 89.99, 'electronics', 'TechBrand', 'WH-001', 50, 1, 'New', 4.5, 12),
('Smart Fitness Watch', 'smart-fitness-watch', 'Track your fitness goals with this advanced smartwatch', 199.99, 'electronics', 'FitTech', 'SW-002', 25, 1, 'Sale', 4.8, 8),
('Premium Cotton T-Shirt', 'premium-cotton-tshirt', 'Comfortable and stylish cotton t-shirt', 29.99, 'fashion', 'FashionCo', 'TS-003', 100, 1, 'Popular', 4.2, 15),
('Designer Jeans', 'designer-jeans', 'Classic designer jeans for everyday wear', 79.99, 'fashion', 'DenimStyle', 'DJ-004', 75, 0, 'Trending', 4.6, 20),
('Modern Coffee Table', 'modern-coffee-table', 'Elegant coffee table for your living room', 299.99, 'home', 'HomeDecor', 'CT-005', 10, 1, 'Limited', 4.9, 5),
('Garden Plant Pots Set', 'garden-plant-pots-set', 'Beautiful ceramic plant pots for your garden', 49.99, 'home', 'GardenCo', 'GP-006', 60, 0, 'Best Seller', 4.7, 18),
('Yoga Mat Premium', 'yoga-mat-premium', 'Non-slip yoga mat for your fitness routine', 39.99, 'sports', 'FitLife', 'YM-007', 80, 1, 'Hot', 4.4, 25),
('Dumbbell Set 20kg', 'dumbbell-set-20kg', 'Professional dumbbell set for strength training', 89.99, 'sports', 'PowerFit', 'DS-008', 30, 0, 'Sale', 4.8, 10);

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', 'Wireless Bluetooth Headphones', 1),
(2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2099&q=80', 'Smart Fitness Watch', 1),
(3, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80', 'Premium Cotton T-Shirt', 1),
(4, 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80', 'Designer Jeans', 1),
(5, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80', 'Modern Coffee Table', 1),
(6, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', 'Garden Plant Pots Set', 1),
(7, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2020&q=80', 'Yoga Mat Premium', 1),
(8, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', 'Dumbbell Set 20kg', 1);

-- Insert sample coupon
INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_amount, usage_limit, valid_until) VALUES
('WELCOME10', 'Welcome Discount', 'Get 10% off your first order', 'percentage', 10.00, 50.00, 100, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('SAVE20', 'Save $20', 'Save $20 on orders over $100', 'fixed', 20.00, 100.00, 50, DATE_ADD(NOW(), INTERVAL 60 DAY)); 