<?php
// api/config/database.php - Database configuration and connection

// Set error reporting for API files that include this config
ini_set('display_errors', 'Off'); // Do not display errors in the browser
error_reporting(E_ALL); // Log all errors

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $conn;

    public function __construct() {
        // Use environment variables for production, fallback to defaults for local development
        // Assuming MySQL for local development based on common setups (root, no password)
        // If you are using PostgreSQL (e.g., Neon), you will need to adjust these values
        $this->host = getenv('PGHOST') ?: 'localhost';
        $this->db_name = getenv('PGDATABASE') ?: 'jobease_db';
        $this->username = getenv('PGUSER') ?: 'root'; 
        $this->password = getenv('PGPASSWORD') ?: ''; 
        $this->port = getenv('PGPORT') ?: '3306'; // Default MySQL port
    }

    public function getConnection() {
        $this->conn = null;

        try {
            // DSN for MySQL. If using PostgreSQL, change 'mysql' to 'pgsql' and port to '5432'
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name;
            
            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
                )
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            // In a production environment, you might want to return a more generic error
            // or redirect to an error page.
            sendJsonResponse(['error' => 'Database connection failed'], 500);
            exit(); // Terminate script execution
        }

        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }
}

// Helper function to get database connection
function getDbConnection() {
    $database = new Database();
    return $database->getConnection();
}

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit(); // Terminate script execution after sending response
}

// Helper function to validate required fields
function validateRequiredFields($data, $requiredFields) {
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = ucfirst($field) . ' is required';
        }
    }
    
    return $errors;
}

// Helper function to sanitize input
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

// Helper function to validate email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Helper function to validate date
function isValidDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

// Helper function to check if date is in the future
function isDateInFuture($date) {
    $inputDate = new DateTime($date);
    $today = new DateTime();
    $today->setTime(0, 0, 0);
    
    return $inputDate > $today;
}
