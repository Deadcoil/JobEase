<?php
// public/index.php - Front Controller

// Start session for admin authentication
session_start();

// Define base path for includes
define('BASE_PATH', __DIR__ . '/../');

// Autoload models and controllers (simple approach for this project)
spl_autoload_register(function ($class_name) {
    $paths = [
        BASE_PATH . 'app/models/',
        BASE_PATH . 'app/controllers/',
    ];
    foreach ($paths as $path) {
        $file = $path . $class_name . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Basic routing logic
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove base directory if running in a subdirectory (e.g., /jobease-php/public/)
$script_name = dirname($_SERVER['SCRIPT_NAME']);
if ($script_name !== '/' && strpos($request_uri, $script_name) === 0) {
    $request_uri = substr($request_uri, strlen($script_name));
}

// Remove trailing slash for consistent routing
$request_uri = rtrim($request_uri, '/');
if (empty($request_uri)) {
    $request_uri = '/';
}

// API Routes
if (strpos($request_uri, '/api/') === 0) {
    // Handle API requests
    $api_path = substr($request_uri, strlen('/api'));
    
    // Public API routes
    if ($api_path === '/jobs' && $request_method === 'GET') {
        require BASE_PATH . 'public/api/jobs.php';
    } elseif ($api_path === '/applications' && $request_method === 'POST') {
        require BASE_PATH . 'public/api/applications.php';
    } 
    // Admin API routes (require authentication)
    elseif (strpos($api_path, '/admin/') === 0) {
        // Simple hardcoded admin check for API routes
        if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit();
        }

        $admin_api_path = substr($api_path, strlen('/admin'));
        
        if ($admin_api_path === '/jobs' && $request_method === 'GET') {
            require BASE_PATH . 'public/api/admin/jobs.php';
        } elseif ($admin_api_path === '/jobs' && $request_method === 'POST') {
            require BASE_PATH . 'public/api/admin/jobs.php';
        } elseif (preg_match('/^\/jobs\/(\d+)$/', $admin_api_path, $matches) && $request_method === 'GET') {
            $_GET['id'] = $matches[1]; // Pass ID to the API script
            require BASE_PATH . 'public/api/admin/jobs.php';
        } elseif (preg_match('/^\/jobs\/(\d+)$/', $admin_api_path, $matches) && $request_method === 'PATCH') {
            $_GET['id'] = $matches[1];
            require BASE_PATH . 'public/api/admin/jobs.php';
        } elseif (preg_match('/^\/jobs\/(\d+)$/', $admin_api_path, $matches) && $request_method === 'DELETE') {
            $_GET['id'] = $matches[1];
            require BASE_PATH . 'public/api/admin/jobs.php';
        } elseif (preg_match('/^\/jobs\/(\d+)\/applications$/', $admin_api_path, $matches) && $request_method === 'GET') {
            $_GET['job_id'] = $matches[1];
            require BASE_PATH . 'public/api/admin/applications.php';
        } elseif ($admin_api_path === '/applications' && $request_method === 'GET') {
            require BASE_PATH . 'public/api/admin/applications.php';
        } elseif ($admin_api_path === '/export-csv' && $request_method === 'GET') {
            require BASE_PATH . 'public/api/admin/export-csv.php';
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Admin API endpoint not found']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not found']);
    }
    exit(); // Stop execution after handling API request
}

// Serve static HTML files for frontend routes
$html_file = '';
switch ($request_uri) {
    case '/':
        $html_file = 'index.html';
        break;
    case '/jobs':
        $html_file = 'jobs.html';
        break;
    case preg_match('/^\/jobs\/(\d+)$/', $request_uri) ? true : false:
        $html_file = 'job-detail.html';
        break;
    case '/admin':
        $html_file = 'admin/login.html';
        break;
    case '/admin/dashboard':
        $html_file = 'admin/dashboard.html';
        break;
    case '/admin/jobs/new':
        $html_file = 'admin/jobs/new.html';
        break;
    case preg_match('/^\/admin\/jobs\/(\d+)\/edit$/', $request_uri) ? true : false:
        $html_file = 'admin/jobs/edit.html';
        break;
    case preg_match('/^\/admin\/jobs\/(\d+)\/applications$/', $request_uri) ? true : false:
        $html_file = 'admin/jobs/applications.html';
        break;
    default:
        // Attempt to serve other static files (CSS, JS, images)
        $file_path = __DIR__ . $request_uri;
        if (file_exists($file_path) && !is_dir($file_path)) {
            $mime_type = mime_content_type($file_path);
            header("Content-Type: " . $mime_type);
            readfile($file_path);
            exit();
        }
        http_response_code(404);
        echo "404 Not Found";
        exit();
}

if ($html_file) {
    // For HTML files, we need to ensure the admin is authenticated for admin pages
    if (strpos($html_file, 'admin/') === 0 && $html_file !== 'admin/login.html') {
        if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
            header('Location: /admin'); // Redirect to login if not authenticated
            exit();
        }
    }
    
    // Serve the HTML file
    header('Content-Type: text/html');
    readfile(__DIR__ . '/' . $html_file);
    exit();
}

// Fallback for any unhandled routes
http_response_code(404);
echo "404 Not Found";