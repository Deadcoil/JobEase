<?php
// api/admin/login.php - Admin login endpoint

require_once '../config/database.php';

// Set CORS headers for development (adjust for production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$requiredFields = ['username', 'password'];
$errors = validateRequiredFields($data, $requiredFields);

if (!empty($errors)) {
    sendJsonResponse(['error' => 'Validation failed', 'details' => $errors], 400);
}

$username = sanitizeInput($data['username']);
$password = $data['password']; // Password will be hashed, so no sanitization for special chars

try {
    $db = getDbConnection();

    // In a real application, you would fetch the user from a 'users' or 'admins' table
    // and verify the hashed password. For this example, we'll use a hardcoded admin.
    // DO NOT USE HARDCODED CREDENTIALS IN PRODUCTION.
    $adminUsername = 'admin';
    $adminPasswordHash = password_hash('admin123', PASSWORD_DEFAULT); // Hash 'adminpassword'

    // For demonstration, check against hardcoded values
    if ($username === $adminUsername && password_verify($password, $adminPasswordHash)) {
        // Start a session and set a session variable for authentication
        session_start();
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;

        sendJsonResponse(['success' => true, 'message' => 'Login successful', 'token' => 'fake-jwt-token']); // In real app, generate JWT
    } else {
        sendJsonResponse(['error' => 'Invalid credentials'], 401);
    }

} catch (Exception $e) {
    error_log("Admin login error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Login failed'], 500);
}
