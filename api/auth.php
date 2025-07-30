<?php
require_once '../config/database.php';

// Set CORS headers
Config::setCORSHeaders();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different request methods
switch ($method) {
    case 'POST':
        handlePostRequest();
        break;
    case 'GET':
        handleGetRequest();
        break;
    default:
        Config::sendError('Method not allowed', 405);
        break;
}

function handlePostRequest() {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'register':
            registerUser($data);
            break;
        case 'login':
            loginUser($data);
            break;
        case 'logout':
            logoutUser();
            break;
        default:
            Config::sendError('Invalid action', 400);
            break;
    }
}

function handleGetRequest() {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'profile':
            getProfile();
            break;
        default:
            Config::sendError('Invalid action', 400);
            break;
    }
}

function registerUser($data) {
    // Validate required fields
    $required_fields = ['firstName', 'lastName', 'email', 'password', 'phone'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            Config::sendError("Field '$field' is required");
        }
    }
    
    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        Config::sendError('Invalid email format');
    }
    
    // Validate password strength
    if (strlen($data['password']) < 8) {
        Config::sendError('Password must be at least 8 characters long');
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Check if email already exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        
        if ($stmt->rowCount() > 0) {
            Config::sendError('Email already registered');
        }
        
        // Hash password
        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $db->prepare("
            INSERT INTO users (first_name, last_name, email, password, phone, newsletter, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $newsletter = isset($data['newsletter']) ? 1 : 0;
        $stmt->execute([
            $data['firstName'],
            $data['lastName'],
            $data['email'],
            $hashed_password,
            $data['phone'],
            $newsletter
        ]);
        
        $user_id = $db->lastInsertId();
        
        // Get user data for response
        $stmt = $db->prepare("SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Generate JWT token
        $token = generateJWT($user);
        
        Config::sendSuccess([
            'user' => $user,
            'token' => $token
        ], 'User registered successfully');
        
    } catch (PDOException $e) {
        Config::sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function loginUser($data) {
    // Validate required fields
    if (empty($data['email']) || empty($data['password'])) {
        Config::sendError('Email and password are required');
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Get user by email
        $stmt = $db->prepare("SELECT id, first_name, last_name, email, password, phone FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            Config::sendError('Invalid email or password');
        }
        
        // Verify password
        if (!password_verify($data['password'], $user['password'])) {
            Config::sendError('Invalid email or password');
        }
        
        // Remove password from response
        unset($user['password']);
        
        // Generate JWT token
        $token = generateJWT($user);
        
        Config::sendSuccess([
            'user' => $user,
            'token' => $token
        ], 'Login successful');
        
    } catch (PDOException $e) {
        Config::sendError('Database error: ' . $e->getMessage(), 500);
    }
}

function logoutUser() {
    // In a real application, you might want to blacklist the token
    // For this demo, we'll just return success
    Config::sendSuccess(null, 'Logout successful');
}

function getProfile() {
    $token = getBearerToken();
    
    if (!$token) {
        Config::sendError('No token provided', 401);
    }
    
    try {
        $payload = verifyJWT($token);
        
        $database = new Database();
        $db = $database->getConnection();
        
        $stmt = $db->prepare("SELECT id, first_name, last_name, email, phone, newsletter, created_at FROM users WHERE id = ?");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            Config::sendError('User not found', 404);
        }
        
        Config::sendSuccess($user, 'Profile retrieved successfully');
        
    } catch (Exception $e) {
        Config::sendError('Invalid token', 401);
    }
}

function generateJWT($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'exp' => time() + Config::JWT_EXPIRY
    ]);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, Config::JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[2]));
    
    $expected_signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], Config::JWT_SECRET, true);
    
    if (!hash_equals($signature, $expected_signature)) {
        throw new Exception('Invalid signature');
    }
    
    $payload_data = json_decode($payload, true);
    
    if ($payload_data['exp'] < time()) {
        throw new Exception('Token expired');
    }
    
    return $payload_data;
}

function getBearerToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}
?> 