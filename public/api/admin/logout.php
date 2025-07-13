<?php
// api/admin/logout.php - Admin logout endpoint

require_once '../config/database.php'; // For sendJsonResponse

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

session_start();
session_unset(); // Unset all session variables
session_destroy(); // Destroy the session

sendJsonResponse(['message' => 'Logout successful']);
