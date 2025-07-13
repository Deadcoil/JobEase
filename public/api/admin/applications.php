<?php
// api/admin/applications.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // WARNING: For development only. Restrict in production.
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS requests (preflight for CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

$conn = getDbConnection();
if ($conn === null) {
    http_response_code(500);
    error_log("API: Database connection failed in applications.php.");
    die(json_encode(["error" => "Database connection failed. Please check server logs."]));
}

$method = $_SERVER['REQUEST_METHOD'];
$job_id = isset($_GET['jobId']) && is_numeric($_GET['jobId']) ? (int)$_GET['jobId'] : null;

error_log("API Applications: Request method: " . $method . ", Job ID: " . ($job_id ?? 'N/A'));


switch ($method) {
    case 'GET':
        if ($job_id !== null) {
            // Fetch applications for a specific job
            $stmt = $conn->prepare("
    SELECT 
        id, 
        job_id, 
        full_name AS applicant_name, 
        email AS applicant_email, 
        phone AS phone_number, 
        resume_url AS resume_path,
        resume_filename AS resume_name, 
        applied_at 
    FROM applications 
    WHERE job_id = ? 
    ORDER BY applied_at DESC
");

            if (!$stmt) {
                error_log("API Applications: Prepare failed for fetching applications: " . implode(" ", $conn->errorInfo()));
                http_response_code(500);
                echo json_encode(["error" => "Failed to prepare statement for applications."]);
                exit;

            }
            $stmt->bindParam(1, $job_id, PDO::PARAM_INT);
            $stmt->execute();
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("API Applications: Fetched " . count($applications) . " applications for job ID " . $job_id);
            echo json_encode($applications);
        } else {
            error_log("API Applications: No Job ID provided. Returning all applications (if applicable).");
            $stmt = $conn->query("
                                    SELECT 
                                        id, 
                                        job_id, 
                                        full_name AS applicant_name, 
                                        email AS applicant_email, 
                                        phone AS phone_number, 
                                        resume_url AS resume_path, 
                                        resume_filename AS resume_name,
                                        applied_at 
                                    FROM applications 
                                    ORDER BY applied_at DESC
                                ");

            if (!$stmt) {
                error_log("API Applications: Query failed for all applications: " . implode(" ", $conn->errorInfo()));
                http_response_code(500);
                echo json_encode(["error" => "Failed to fetch all applications."]);
                exit;

            }
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($applications);
        }
        break;

    case 'POST':
    case 'PUT':
    case 'DELETE':
        http_response_code(405); // Method Not Allowed
        error_log("API Applications: Method " . $method . " not implemented for this endpoint.");
        echo json_encode(["message" => "Method not allowed."]);
        break;

    default:
        http_response_code(405); // Method Not Allowed
        error_log("API Applications: Unknown method " . $method . " received.");
        echo json_encode(["message" => "Method not allowed."]);
        break;
}

$conn = null;
?>
