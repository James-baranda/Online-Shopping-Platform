<?php
// Database configuration
class Database {
    private $host = 'localhost';
    private $db_name = 'shophub_db';
    private $username = 'root';
    private $password = '';
    private $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}

// API configuration
class Config {
    const JWT_SECRET = 'your-secret-key-here';
    const JWT_EXPIRY = 3600; // 1 hour
    
    // CORS headers
    public static function setCORSHeaders() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Content-Type: application/json; charset=UTF-8");
        
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
    
    // Response helper
    public static function sendResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data);
        exit();
    }
    
    // Error response helper
    public static function sendError($message, $status = 400) {
        self::sendResponse(['error' => $message], $status);
    }
    
    // Success response helper
    public static function sendSuccess($data, $message = 'Success') {
        self::sendResponse(['success' => true, 'message' => $message, 'data' => $data]);
    }
}
?> 