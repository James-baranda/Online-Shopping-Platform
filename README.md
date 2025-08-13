# ShopHub - E-Commerce Website link

https://online-shopping-platform-tan.vercel.app/

A fully functional E-Commerce website built with HTML, CSS, JavaScript, and PHP. Features a modern, responsive design with shopping cart functionality, product filtering, user registration, and more.

## 🚀 Features

### Frontend Features
- **Modern Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Shopping Cart** - Add/remove items, quantity management, real-time total calculation
- **Product Filtering** - Filter by category, price range, brand, and rating
- **Search Functionality** - Search products by name and description
- **User Authentication** - Registration and login with form validation
- **Product Categories** - Browse products by category
- **Wishlist** - Save products to wishlist
- **Newsletter Subscription** - Email subscription for updates
- **Responsive Navigation** - Mobile-friendly navigation with hamburger menu

### Backend Features
- **PHP API Endpoints** - RESTful API for authentication and products
- **Database Integration** - MySQL database with comprehensive schema
- **JWT Authentication** - Secure token-based authentication
- **User Management** - Registration, login, profile management
- **Product Management** - Product listing, filtering, and search
- **Cart Management** - Persistent cart functionality
- **Order Management** - Complete order processing system

## 📁 Project Structure

```
E-Commerce Website/
├── index.html                 # Homepage
├── products.html              # Products listing page
├── login.html                 # User login page
├── register.html              # User registration page
├── css/
│   ├── style.css              # Main stylesheet
│   ├── products.css           # Products page styles
│   └── auth.css               # Authentication pages styles
├── js/
│   ├── main.js                # Main JavaScript functionality
│   ├── products.js            # Products page functionality
│   └── auth.js                # Authentication functionality
├── api/
│   ├── auth.php               # Authentication API endpoints
│   └── products.php           # Products API endpoints
├── config/
│   └── database.php           # Database configuration
├── database/
│   └── schema.sql             # Database schema and sample data
└── README.md                  # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Web server (Apache/Nginx) with PHP support
- MySQL database server
- PHP 7.4 or higher
- Modern web browser

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   git clone <repository-url>
   cd "E-Commerce Website"
   ```

2. **Set Up Web Server**
   - Place the project files in your web server's document root
   - Ensure the web server has read/write permissions

3. **Configure Database**
   - Create a MySQL database named `shophub_db`
   - Import the database schema:
   ```bash
   mysql -u root -p shophub_db < database/schema.sql
   ```

4. **Configure Database Connection**
   - Edit `config/database.php`
   - Update the database credentials:
   ```php
   private $host = 'localhost';
   private $db_name = 'shophub_db';
   private $username = 'your_username';
   private $password = 'your_password';
   ```

5. **Set Up PHP Environment**
   - Ensure PHP has the following extensions enabled:
     - PDO
     - PDO_MySQL
     - JSON
     - OpenSSL (for JWT)

6. **Configure Web Server (Optional)**
   - For Apache, create `.htaccess` file in the root directory:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^api/(.*)$ api/$1 [QSA,L]
   ```

7. **Test the Installation**
   - Open your web browser
   - Navigate to `http://localhost/your-project-folder`
   - You should see the ShopHub homepage

## 🎯 Usage Guide

### For Users

1. **Browsing Products**
   - Visit the homepage to see featured products
   - Click "Products" to browse all products
   - Use filters to narrow down products by category, price, etc.
   - Use the search bar to find specific products

2. **Shopping Cart**
   - Click "Add to Cart" on any product
   - View cart by clicking the cart icon in the header
   - Modify quantities or remove items
   - Proceed to checkout (requires login)

3. **User Account**
   - Click "Register" to create a new account
   - Click "Login" to sign in with existing credentials
   - Demo credentials: `demo@example.com` / `password123`

4. **Wishlist**
   - Click the heart icon on any product to add to wishlist
   - View and manage your wishlist items

### For Developers

1. **API Endpoints**

   **Authentication:**
   - `POST /api/auth.php?action=register` - User registration
   - `POST /api/auth.php?action=login` - User login
   - `GET /api/auth.php?action=profile` - Get user profile

   **Products:**
   - `GET /api/products.php?action=list` - Get products with filters
   - `GET /api/products.php?action=featured` - Get featured products
   - `GET /api/products.php?action=categories` - Get product categories

2. **Customization**
   - Modify CSS files in the `css/` directory
   - Update JavaScript functionality in the `js/` directory
   - Add new API endpoints in the `api/` directory
   - Extend database schema as needed

## 🔧 Configuration

### Database Configuration
Edit `config/database.php` to match your database settings:
```php
private $host = 'localhost';
private $db_name = 'shophub_db';
private $username = 'your_username';
private $password = 'your_password';
```

### JWT Configuration
Update the JWT secret in `config/database.php`:
```php
const JWT_SECRET = 'your-secret-key-here';
```

### API Configuration
The API includes CORS headers for cross-origin requests. Modify as needed in `config/database.php`.

## 🎨 Customization

### Styling
- Main styles are in `css/style.css`
- Product page styles in `css/products.css`
- Authentication page styles in `css/auth.css`

### JavaScript
- Main functionality in `js/main.js`
- Products functionality in `js/products.js`
- Authentication in `js/auth.js`

### Adding New Features
1. Create new HTML pages as needed
2. Add corresponding CSS files
3. Create JavaScript files for functionality
4. Add PHP API endpoints if required
5. Update database schema if needed

## 🚀 Deployment

### Local Development
- Use XAMPP, WAMP, or similar local server
- Ensure all file permissions are correct
- Test all functionality before deployment

### Production Deployment
1. Upload files to your web server
2. Configure database connection
3. Set up SSL certificate for security
4. Configure web server for optimal performance
5. Test all functionality thoroughly

## 🔒 Security Features

- Password hashing using PHP's `password_hash()`
- JWT token-based authentication
- SQL injection prevention with prepared statements
- Input validation and sanitization
- CORS headers for API security

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `config/database.php`
   - Ensure MySQL server is running
   - Verify database exists

2. **API Endpoints Not Working**
   - Check web server configuration
   - Ensure PHP is properly configured
   - Check file permissions

3. **Cart Not Saving**
   - Check browser localStorage support
   - Ensure JavaScript is enabled
   - Check for JavaScript errors in console

4. **Images Not Loading**
   - Verify image URLs are accessible
   - Check network connectivity
   - Ensure proper file permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For support or questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code comments for guidance

## 🎉 Demo

The website includes demo functionality:
- Sample products with images
- Demo user account
- Working shopping cart
- Product filtering and search
- Responsive design


Enjoy building and customizing your E-Commerce website! 🛍️ 
