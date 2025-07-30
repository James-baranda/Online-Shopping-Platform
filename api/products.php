<?php
require_once '../config/database.php';

// Set CORS headers
Config::setCORSHeaders();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different request methods
switch ($method) {
    case 'GET':
        handleGetRequest();
        break;
    default:
        Config::sendError('Method not allowed', 405);
        break;
}

function handleGetRequest() {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'list':
            getProducts();
            break;
        case 'featured':
            getFeaturedProducts();
            break;
        case 'categories':
            getCategories();
            break;
        default:
            Config::sendError('Invalid action', 400);
            break;
    }
}

function getProducts() {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Get query parameters
        $category = $_GET['category'] ?? '';
        $search = $_GET['search'] ?? '';
        $min_price = $_GET['min_price'] ?? 0;
        $max_price = $_GET['max_price'] ?? 999999;
        $sort = $_GET['sort'] ?? 'name';
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = max(1, min(50, intval($_GET['limit'] ?? 12)));
        $offset = ($page - 1) * $limit;
        
        // Build query
        $where_conditions = [];
        $params = [];
        
        if (!empty($category)) {
            $where_conditions[] = "category = ?";
            $params[] = $category;
        }
        
        if (!empty($search)) {
            $where_conditions[] = "(name LIKE ? OR description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        $where_conditions[] = "price BETWEEN ? AND ?";
        $params[] = $min_price;
        $params[] = $max_price;
        
        $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
        
        // Validate sort parameter
        $allowed_sorts = ['name', 'price', 'created_at'];
        $sort_direction = 'ASC';
        
        if (strpos($sort, '-') === 0) {
            $sort = substr($sort, 1);
            $sort_direction = 'DESC';
        }
        
        if (!in_array($sort, $allowed_sorts)) {
            $sort = 'name';
        }
        
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM products $where_clause";
        $stmt = $db->prepare($count_query);
        $stmt->execute($params);
        $total_count = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get products
        $query = "
            SELECT id, name, description, price, category, image, badge, stock, rating, created_at 
            FROM products 
            $where_clause 
            ORDER BY $sort $sort_direction 
            LIMIT ? OFFSET ?
        ";
        
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format response
        $response = [
            'products' => $products,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total_count,
                'total_pages' => ceil($total_count / $limit),
                'has_next' => $page < ceil($total_count / $limit),
                'has_prev' => $page > 1
            ],
            'filters' => [
                'category' => $category,
                'search' => $search,
                'min_price' => $min_price,
                'max_price' => $max_price,
                'sort' => $sort
            ]
        ];
        
        Config::sendSuccess($response, 'Products retrieved successfully');
        
    } catch (PDOException $e) {
        Config::sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getFeaturedProducts() {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $limit = max(1, min(20, intval($_GET['limit'] ?? 8)));
        
        $query = "
            SELECT id, name, description, price, category, image, badge, stock, rating, created_at 
            FROM products 
            WHERE featured = 1 
            ORDER BY rating DESC, created_at DESC 
            LIMIT ?
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$limit]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        Config::sendSuccess($products, 'Featured products retrieved successfully');
        
    } catch (PDOException $e) {
        Config::sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function getCategories() {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "
            SELECT category, COUNT(*) as product_count 
            FROM products 
            GROUP BY category 
            ORDER BY product_count DESC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        Config::sendSuccess($categories, 'Categories retrieved successfully');
        
    } catch (PDOException $e) {
        Config::sendError('Database error: ' . $e->getMessage(), 500);
    }
}

// Sample data for demo purposes (if database is not available)
function getSampleProducts() {
    return [
        [
            'id' => 1,
            'name' => 'Wireless Bluetooth Headphones',
            'description' => 'High-quality wireless headphones with noise cancellation',
            'price' => 89.99,
            'category' => 'electronics',
            'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            'badge' => 'New',
            'stock' => 50,
            'rating' => 4.5,
            'featured' => 1,
            'created_at' => '2024-01-15 10:00:00'
        ],
        [
            'id' => 2,
            'name' => 'Smart Fitness Watch',
            'description' => 'Track your fitness goals with this advanced smartwatch',
            'price' => 199.99,
            'category' => 'electronics',
            'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2099&q=80',
            'badge' => 'Sale',
            'stock' => 25,
            'rating' => 4.8,
            'featured' => 1,
            'created_at' => '2024-01-14 15:30:00'
        ],
        [
            'id' => 3,
            'name' => 'Premium Cotton T-Shirt',
            'description' => 'Comfortable and stylish cotton t-shirt',
            'price' => 29.99,
            'category' => 'fashion',
            'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
            'badge' => 'Popular',
            'stock' => 100,
            'rating' => 4.2,
            'featured' => 1,
            'created_at' => '2024-01-13 09:15:00'
        ],
        [
            'id' => 4,
            'name' => 'Designer Jeans',
            'description' => 'Classic designer jeans for everyday wear',
            'price' => 79.99,
            'category' => 'fashion',
            'image' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80',
            'badge' => 'Trending',
            'stock' => 75,
            'rating' => 4.6,
            'featured' => 0,
            'created_at' => '2024-01-12 14:20:00'
        ],
        [
            'id' => 5,
            'name' => 'Modern Coffee Table',
            'description' => 'Elegant coffee table for your living room',
            'price' => 299.99,
            'category' => 'home',
            'image' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
            'badge' => 'Limited',
            'stock' => 10,
            'rating' => 4.9,
            'featured' => 1,
            'created_at' => '2024-01-11 11:45:00'
        ],
        [
            'id' => 6,
            'name' => 'Garden Plant Pots Set',
            'description' => 'Beautiful ceramic plant pots for your garden',
            'price' => 49.99,
            'category' => 'home',
            'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            'badge' => 'Best Seller',
            'stock' => 60,
            'rating' => 4.7,
            'featured' => 0,
            'created_at' => '2024-01-10 16:30:00'
        ],
        [
            'id' => 7,
            'name' => 'Yoga Mat Premium',
            'description' => 'Non-slip yoga mat for your fitness routine',
            'price' => 39.99,
            'category' => 'sports',
            'image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2020&q=80',
            'badge' => 'Hot',
            'stock' => 80,
            'rating' => 4.4,
            'featured' => 1,
            'created_at' => '2024-01-09 13:15:00'
        ],
        [
            'id' => 8,
            'name' => 'Dumbbell Set 20kg',
            'description' => 'Professional dumbbell set for strength training',
            'price' => 89.99,
            'category' => 'sports',
            'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            'badge' => 'Sale',
            'stock' => 30,
            'rating' => 4.8,
            'featured' => 0,
            'created_at' => '2024-01-08 10:00:00'
        ]
    ];
}
?> 