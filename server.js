const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Database setup
const db = new sqlite3.Database('./database/shop.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createProductsTable = `
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            brand TEXT,
            rating REAL DEFAULT 0,
            stock INTEGER DEFAULT 0,
            featured BOOLEAN DEFAULT 0,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createCartTable = `
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            quantity INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    `;

    db.serialize(() => {
        db.run(createUsersTable);
        db.run(createProductsTable);
        db.run(createCartTable);
        
        // Insert sample products if table is empty
        db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
            if (row.count === 0) {
                insertSampleProducts();
            }
        });
    });
}

// Insert sample products
function insertSampleProducts() {
    const sampleProducts = [
        {
            name: "Wireless Bluetooth Headphones",
            description: "High-quality wireless headphones with noise cancellation",
            price: 89.99,
            category: "Electronics",
            brand: "TechSound",
            rating: 4.5,
            stock: 50,
            featured: 1,
            image_url: "https://via.placeholder.com/300x300?text=Headphones"
        },
        {
            name: "Smart Fitness Watch",
            description: "Track your fitness goals with this advanced smartwatch",
            price: 199.99,
            category: "Electronics",
            brand: "FitTech",
            rating: 4.3,
            stock: 30,
            featured: 1,
            image_url: "https://via.placeholder.com/300x300?text=Smartwatch"
        },
        {
            name: "Organic Cotton T-Shirt",
            description: "Comfortable and eco-friendly cotton t-shirt",
            price: 24.99,
            category: "Clothing",
            brand: "EcoWear",
            rating: 4.2,
            stock: 100,
            featured: 1,
            image_url: "https://via.placeholder.com/300x300?text=T-Shirt"
        },
        {
            name: "Stainless Steel Water Bottle",
            description: "Keep your drinks cold for 24 hours",
            price: 19.99,
            category: "Home & Garden",
            brand: "HydroLife",
            rating: 4.7,
            stock: 75,
            featured: 1,
            image_url: "https://via.placeholder.com/300x300?text=Water+Bottle"
        },
        {
            name: "Wireless Charging Pad",
            description: "Fast wireless charging for all compatible devices",
            price: 39.99,
            category: "Electronics",
            brand: "PowerTech",
            rating: 4.1,
            stock: 40,
            featured: 0,
            image_url: "https://via.placeholder.com/300x300?text=Charging+Pad"
        },
        {
            name: "Yoga Mat",
            description: "Non-slip yoga mat for home workouts",
            price: 29.99,
            category: "Sports",
            brand: "FitLife",
            rating: 4.4,
            stock: 60,
            featured: 0,
            image_url: "https://via.placeholder.com/300x300?text=Yoga+Mat"
        }
    ];

    const insertProduct = db.prepare(`
        INSERT INTO products (name, description, price, category, brand, rating, stock, featured, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleProducts.forEach(product => {
        insertProduct.run([
            product.name,
            product.description,
            product.price,
            product.category,
            product.brand,
            product.rating,
            product.stock,
            product.featured,
            product.image_url
        ]);
    });

    insertProduct.finalize();
    console.log('Sample products inserted successfully');
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password } = req.body;

        // Validate input
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Check if user already exists
        db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (row) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            db.run(
                "INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)",
                [first_name, last_name, email, phone, hashedPassword],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error creating user' });
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        { id: this.lastID, email, first_name, last_name },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        message: 'User registered successfully',
                        token,
                        user: {
                            id: this.lastID,
                            first_name,
                            last_name,
                            email,
                            phone
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone
            }
        });
    });
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    db.get("SELECT id, first_name, last_name, email, phone, created_at FROM users WHERE id = ?", 
        [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    let query = "SELECT * FROM products WHERE 1=1";
    let params = [];

    // Apply filters
    if (category) {
        query += " AND category = ?";
        params.push(category);
    }
    if (search) {
        query += " AND (name LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }
    if (minPrice) {
        query += " AND price >= ?";
        params.push(minPrice);
    }
    if (maxPrice) {
        query += " AND price <= ?";
        params.push(maxPrice);
    }

    // Apply sorting
    if (sort) {
        switch (sort) {
            case 'price_asc':
                query += " ORDER BY price ASC";
                break;
            case 'price_desc':
                query += " ORDER BY price DESC";
                break;
            case 'rating':
                query += " ORDER BY rating DESC";
                break;
            case 'name':
                query += " ORDER BY name ASC";
                break;
            default:
                query += " ORDER BY created_at DESC";
        }
    } else {
        query += " ORDER BY created_at DESC";
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ products });
    });
});

// Get featured products
app.get('/api/products/featured', (req, res) => {
    db.all("SELECT * FROM products WHERE featured = 1 LIMIT 6", (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ products });
    });
});

// Get product categories
app.get('/api/products/categories', (req, res) => {
    db.all("SELECT category, COUNT(*) as count FROM products GROUP BY category", (err, categories) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ categories });
    });
});

// Cart operations
app.post('/api/cart/add', authenticateToken, (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user.id;

    if (!product_id) {
        return res.status(400).json({ error: 'Product ID required' });
    }

    // Check if item already in cart
    db.get("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [user_id, product_id], (err, item) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (item) {
            // Update quantity
            db.run("UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?", 
                [quantity, user_id, product_id], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating cart' });
                }
                res.json({ message: 'Cart updated successfully' });
            });
        } else {
            // Add new item
            db.run("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", 
                [user_id, product_id, quantity], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error adding to cart' });
                }
                res.json({ message: 'Item added to cart successfully' });
            });
        }
    });
});

app.get('/api/cart', authenticateToken, (req, res) => {
    const user_id = req.user.id;

    db.all(`
        SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.image_url
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `, [user_id], (err, cartItems) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ cartItems });
    });
});

app.delete('/api/cart/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    db.run("DELETE FROM cart WHERE id = ? AND user_id = ?", [id, user_id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        res.json({ message: 'Item removed from cart successfully' });
    });
});

// Serve the main HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ShopHub Backend Server running on http://localhost:${PORT}`);
    console.log(`📱 Frontend available at http://localhost:${PORT}`);
    console.log(`🔧 API endpoints available at http://localhost:${PORT}/api`);
}); 