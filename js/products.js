// Products page functionality
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 8;
let currentFilters = {
    categories: [],
    priceRange: { min: 0, max: 500 },
    brands: [],
    ratings: []
};

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const productsCount = document.getElementById('productsCount');
const showingCount = document.getElementById('showingCount');
const totalCount = document.getElementById('totalCount');
const pagination = document.getElementById('pagination');
const filterToggle = document.getElementById('filterToggle');
const filtersSidebar = document.getElementById('filtersSidebar');
const clearFilters = document.getElementById('clearFilters');
const sortSelect = document.getElementById('sortSelect');

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
    setupProductsEventListeners();
});

// Initialize products page
function initializeProductsPage() {
    // Load products from main.js or fetch from API
    allProducts = window.sampleProducts || [];
    
    // Check URL parameters for initial filters
    checkUrlParameters();
    
    // Apply initial filters and load products
    applyFilters();
    loadProducts();
}

// Setup event listeners for products page
function setupProductsEventListeners() {
    // Filter toggles
    filterToggle.addEventListener('click', toggleFilters);
    
    // Category filters
    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.addEventListener('change', handleCategoryFilter);
    });
    
    // Price range filter
    const priceRange = document.getElementById('priceRange');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    priceRange.addEventListener('input', handlePriceRangeChange);
    minPrice.addEventListener('input', handlePriceInputChange);
    maxPrice.addEventListener('input', handlePriceInputChange);
    
    // Brand filters
    document.querySelectorAll('.brand-filter').forEach(checkbox => {
        checkbox.addEventListener('change', handleBrandFilter);
    });
    
    // Rating filters
    document.querySelectorAll('.rating-filter').forEach(checkbox => {
        checkbox.addEventListener('change', handleRatingFilter);
    });
    
    // Clear filters
    clearFilters.addEventListener('click', clearAllFilters);
    
    // Sort select
    sortSelect.addEventListener('change', handleSortChange);
    
    // Close filters on mobile
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-overlay')) {
            closeFilters();
        }
    });
}

// Check URL parameters for initial filters
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Category filter
    const category = urlParams.get('category');
    if (category) {
        currentFilters.categories = [category];
        const categoryCheckbox = document.querySelector(`.category-filter[value="${category}"]`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
        }
    }
    
    // Search filter
    const search = urlParams.get('search');
    if (search) {
        document.getElementById('searchInput').value = search;
        currentFilters.search = search;
    }
}

// Toggle filters sidebar on mobile
function toggleFilters() {
    filtersSidebar.classList.toggle('open');
    
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.filter-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'filter-overlay';
        document.body.appendChild(overlay);
    }
    
    overlay.classList.toggle('open');
    document.body.style.overflow = filtersSidebar.classList.contains('open') ? 'hidden' : 'auto';
}

// Close filters sidebar
function closeFilters() {
    filtersSidebar.classList.remove('open');
    const overlay = document.querySelector('.filter-overlay');
    if (overlay) {
        overlay.classList.remove('open');
    }
    document.body.style.overflow = 'auto';
}

// Handle category filter
function handleCategoryFilter() {
    const checkedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(checkbox => checkbox.value);
    
    currentFilters.categories = checkedCategories;
    applyFilters();
}

// Handle price range change
function handlePriceRangeChange() {
    const priceRange = document.getElementById('priceRange');
    const maxPrice = document.getElementById('maxPrice');
    
    currentFilters.priceRange.max = parseInt(priceRange.value);
    maxPrice.value = priceRange.value;
    
    applyFilters();
}

// Handle price input change
function handlePriceInputChange() {
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const priceRange = document.getElementById('priceRange');
    
    const min = parseInt(minPrice.value) || 0;
    const max = parseInt(maxPrice.value) || 500;
    
    currentFilters.priceRange = { min, max };
    priceRange.value = max;
    
    applyFilters();
}

// Handle brand filter
function handleBrandFilter() {
    const checkedBrands = Array.from(document.querySelectorAll('.brand-filter:checked'))
        .map(checkbox => checkbox.value);
    
    currentFilters.brands = checkedBrands;
    applyFilters();
}

// Handle rating filter
function handleRatingFilter() {
    const checkedRatings = Array.from(document.querySelectorAll('.rating-filter:checked'))
        .map(checkbox => parseInt(checkbox.value));
    
    currentFilters.ratings = checkedRatings;
    applyFilters();
}

// Apply all filters
function applyFilters() {
    filteredProducts = allProducts.filter(product => {
        // Category filter
        if (currentFilters.categories.length > 0 && !currentFilters.categories.includes(product.category)) {
            return false;
        }
        
        // Price filter
        if (product.price < currentFilters.priceRange.min || product.price > currentFilters.priceRange.max) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const productName = product.name.toLowerCase();
            const productDescription = product.description.toLowerCase();
            
            if (!productName.includes(searchTerm) && !productDescription.includes(searchTerm)) {
                return false;
            }
        }
        
        // Brand filter (if product has brand property)
        if (currentFilters.brands.length > 0 && product.brand && !currentFilters.brands.includes(product.brand)) {
            return false;
        }
        
        // Rating filter (if product has rating property)
        if (currentFilters.ratings.length > 0 && product.rating) {
            const maxRating = Math.max(...currentFilters.ratings);
            if (product.rating < maxRating) {
                return false;
            }
        }
        
        return true;
    });
    
    // Apply sorting
    applySorting();
    
    // Reset to first page
    currentPage = 1;
    
    // Load products
    loadProducts();
}

// Apply sorting
function applySorting() {
    const sortValue = sortSelect.value;
    
    switch (sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Keep original order
            break;
    }
}

// Handle sort change
function handleSortChange() {
    applySorting();
    loadProducts();
}

// Load products for current page
function loadProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // Update product count
    totalCount.textContent = filteredProducts.length;
    showingCount.textContent = productsToShow.length;
    
    // Show loading state
    productsGrid.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    // Simulate loading delay
    setTimeout(() => {
        if (productsToShow.length === 0) {
            showEmptyState();
        } else {
            displayProducts(productsToShow);
        }
        
        generatePagination();
    }, 300);
}

// Display products
function displayProducts(products) {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="wishlist-btn" data-product-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to new product cards
    addProductCardListeners();
}

// Show empty state
function showEmptyState() {
    productsGrid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms to find what you're looking for.</p>
            <button class="btn btn-primary" onclick="clearAllFilters()">Clear All Filters</button>
        </div>
    `;
}

// Generate pagination
function generatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        loadProducts();
        
        // Scroll to top of products section
        document.querySelector('.products-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }
}

// Clear all filters
function clearAllFilters() {
    // Reset filter checkboxes
    document.querySelectorAll('.category-filter, .brand-filter, .rating-filter').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset price range
    const priceRange = document.getElementById('priceRange');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    
    priceRange.value = 500;
    minPrice.value = '';
    maxPrice.value = '';
    
    // Reset sort
    sortSelect.value = 'default';
    
    // Clear search
    document.getElementById('searchInput').value = '';
    
    // Reset filters
    currentFilters = {
        categories: [],
        priceRange: { min: 0, max: 500 },
        brands: [],
        ratings: []
    };
    
    // Apply filters
    applyFilters();
    
    // Show notification
    if (window.ShopHub && window.ShopHub.showNotification) {
        window.ShopHub.showNotification('All filters cleared!', 'info');
    }
}

// Add event listeners to product cards
function addProductCardListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            if (window.ShopHub && window.ShopHub.addToCart) {
                window.ShopHub.addToCart(productId);
            }
        });
    });
    
    // Wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            toggleWishlist(productId);
        });
    });
}

// Toggle wishlist
function toggleWishlist(productId) {
    const button = document.querySelector(`[data-product-id="${productId}"].wishlist-btn`);
    if (button.classList.contains('active')) {
        button.classList.remove('active');
        if (window.ShopHub && window.ShopHub.showNotification) {
            window.ShopHub.showNotification('Removed from wishlist!', 'info');
        }
    } else {
        button.classList.add('active');
        if (window.ShopHub && window.ShopHub.showNotification) {
            window.ShopHub.showNotification('Added to wishlist!', 'success');
        }
    }
}

// Update URL with current filters
function updateURL() {
    const url = new URL(window.location);
    
    // Clear existing parameters
    url.searchParams.delete('category');
    url.searchParams.delete('search');
    
    // Add current filters
    if (currentFilters.categories.length > 0) {
        url.searchParams.set('category', currentFilters.categories[0]);
    }
    
    if (currentFilters.search) {
        url.searchParams.set('search', currentFilters.search);
    }
    
    // Update URL without reloading
    window.history.pushState({}, '', url);
}

// Export functions for global access
window.changePage = changePage;
window.clearAllFilters = clearAllFilters; 