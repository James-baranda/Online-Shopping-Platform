// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupAuthEventListeners();
});

// Initialize authentication
function initializeAuth() {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
        window.location.href = 'index.html';
    }
}

// Setup authentication event listeners
function setupAuthEventListeners() {
    // Password toggle functionality
    setupPasswordToggles();
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupPasswordStrength();
        setupFormValidation();
    }
    
    // Social login buttons
    setupSocialLogin();
}

// Setup password toggle functionality
function setupPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Setup password strength checker
function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
}

// Check password strength
function checkPasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    // Cap at 100%
    strength = Math.min(strength, 100);
    
    // Update UI
    strengthFill.className = 'strength-fill';
    
    if (strength <= 25) {
        strengthFill.classList.add('weak');
        feedback = 'Weak password';
    } else if (strength <= 50) {
        strengthFill.classList.add('fair');
        feedback = 'Fair password';
    } else if (strength <= 75) {
        strengthFill.classList.add('good');
        feedback = 'Good password';
    } else {
        strengthFill.classList.add('strong');
        feedback = 'Strong password';
    }
    
    strengthText.textContent = feedback;
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('.auth-form input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (field.type) {
        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'Email is required';
            } else if (!isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
            
        case 'password':
            if (!value) {
                isValid = false;
                errorMessage = 'Password is required';
            } else if (value.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long';
            }
            break;
            
        case 'tel':
            if (!value) {
                isValid = false;
                errorMessage = 'Phone number is required';
            } else if (!isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
            
        default:
            if (!value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        showFieldSuccess(field);
    }
    
    return isValid;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Show field error
function showFieldError(field, message) {
    field.classList.remove('success');
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
    field.parentNode.appendChild(errorDiv);
}

// Show field success
function showFieldSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('error', 'success');
    
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const rememberMe = form.rememberMe?.checked;
    
    // Validate form
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.auth-btn');
    const btnText = submitBtn.querySelector('span');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Check credentials (in real app, this would be an API call)
        if (email === 'demo@example.com' && password === 'password123') {
            // Success
            const user = {
                id: 1,
                name: 'Demo User',
                email: email,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
            };
            
            // Save user data
            localStorage.setItem('user', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            // Show success message
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // Error
            showNotification('Invalid email or password', 'error');
            
            // Reset button state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }, 2000);
}

// Validate login form
function validateLoginForm(email, password) {
    let isValid = true;
    
    if (!email) {
        showFieldError(document.getElementById('email'), 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(document.getElementById('email'), 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password) {
        showFieldError(document.getElementById('password'), 'Password is required');
        isValid = false;
    }
    
    return isValid;
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        firstName: form.firstName.value.trim(),
        lastName: form.lastName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        password: form.password.value,
        confirmPassword: form.confirmPassword.value,
        agreeTerms: form.agreeTerms.checked,
        newsletter: form.newsletter?.checked
    };
    
    // Validate form
    if (!validateRegisterForm(formData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.auth-btn');
    const btnText = submitBtn.querySelector('span');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Check if email already exists (in real app, this would be an API call)
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const emailExists = existingUsers.some(user => user.email === formData.email);
        
        if (emailExists) {
            showNotification('Email already registered. Please use a different email.', 'error');
            
            // Reset button state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            firstName: formData.firstName,
            lastName: formData.lastName,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            password: formData.password, // In real app, this should be hashed
            newsletter: formData.newsletter,
            createdAt: new Date().toISOString()
        };
        
        // Save user to localStorage (in real app, this would be saved to database)
        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        
        // Auto-login the new user
        localStorage.setItem('user', JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }));
        
        // Show success message
        showNotification('Account created successfully! Welcome to ShopHub!', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    }, 2000);
}

// Validate register form
function validateRegisterForm(data) {
    let isValid = true;
    
    // Validate first name
    if (!data.firstName) {
        showFieldError(document.getElementById('firstName'), 'First name is required');
        isValid = false;
    }
    
    // Validate last name
    if (!data.lastName) {
        showFieldError(document.getElementById('lastName'), 'Last name is required');
        isValid = false;
    }
    
    // Validate email
    if (!data.email) {
        showFieldError(document.getElementById('email'), 'Email is required');
        isValid = false;
    } else if (!isValidEmail(data.email)) {
        showFieldError(document.getElementById('email'), 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone
    if (!data.phone) {
        showFieldError(document.getElementById('phone'), 'Phone number is required');
        isValid = false;
    } else if (!isValidPhone(data.phone)) {
        showFieldError(document.getElementById('phone'), 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate password
    if (!data.password) {
        showFieldError(document.getElementById('password'), 'Password is required');
        isValid = false;
    } else if (data.password.length < 8) {
        showFieldError(document.getElementById('password'), 'Password must be at least 8 characters long');
        isValid = false;
    }
    
    // Validate confirm password
    if (!data.confirmPassword) {
        showFieldError(document.getElementById('confirmPassword'), 'Please confirm your password');
        isValid = false;
    } else if (data.password !== data.confirmPassword) {
        showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match');
        isValid = false;
    }
    
    // Validate terms agreement
    if (!data.agreeTerms) {
        showNotification('Please agree to the Terms & Conditions and Privacy Policy', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Setup social login
function setupSocialLogin() {
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const provider = this.classList.contains('google-btn') ? 'Google' : 'Facebook';
            showNotification(`${provider} login is not implemented in this demo. Please use the form above.`, 'info');
        });
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Demo credentials helper
function showDemoCredentials() {
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (isLoginPage) {
        showNotification('Demo credentials: demo@example.com / password123', 'info');
    }
}

// Add demo credentials button for testing
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('login.html')) {
        const demoBtn = document.createElement('button');
        demoBtn.textContent = 'Show Demo Credentials';
        demoBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #3498db;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.8rem;
            z-index: 1000;
        `;
        demoBtn.addEventListener('click', showDemoCredentials);
        document.body.appendChild(demoBtn);
    }
}); 