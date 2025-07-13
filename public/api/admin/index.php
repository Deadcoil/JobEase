<?php
// api/admin/index.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // WARNING: For development only. Restrict in production.
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS requests (preflight for CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include the database connection file
// This line just makes the functions/classes in database.php available
require_once __DIR__ . '/../config/database.php';

// Get the database connection using the helper function
$conn = getDbConnection(); // <-- CORRECT WAY TO GET THE PDO OBJECT

// Check if connection was successful
if ($conn === null) {
    // sendJsonResponse already called in database.php on connection error
    // This line will only be reached if getDbConnection returns null without exiting
    http_response_code(500);
    error_log("API: Database connection failed in index.php after getDbConnection.");
    die(json_encode(["error" => "Database connection failed. Please check server logs."]));
}

// Parse the request URI to get the resource and potential ID
$request_uri_segments = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$job_id = null;

// Find the position of 'jobs' in the URL segments to correctly extract the ID
// This logic needs to be robust to handle /api/jobs and /api/jobs/{id}
$jobs_segment_index = array_search('jobs', $request_uri_segments);

error_log("API: Request URI segments: " . implode(', ', $request_uri_segments));
error_log("API: 'jobs' segment index: " . ($jobs_segment_index !== false ? $jobs_segment_index : 'not found'));


if ($jobs_segment_index !== false && ($jobs_segment_index + 1) < count($request_uri_segments)) {
    $potential_id = $request_uri_segments[$jobs_segment_index + 1];
    if (is_numeric($potential_id)) {
        $job_id = (int)$potential_id;
        error_log("API: Detected job_id from URL path: " . $job_id);
    } else {
        error_log("API: Potential ID from path '" . $potential_id . "' is not numeric.");
    }
}

// ✅ Fallback: also support query param like index.php?id=6
if ($job_id === null && isset($_GET['id']) && is_numeric($_GET['id'])) {
    $job_id = (int)$_GET['id'];
    error_log("API: Detected job_id from query string: " . $job_id);
}

if ($job_id === null) {
    error_log("API: No job ID found in URL path or query string (fetching all jobs).");
}



$method = $_SERVER['REQUEST_METHOD'];
error_log("API: Request method: " . $method);

switch ($method) {
    case 'GET':
        if ($job_id !== null) {
            // Fetch single job
            error_log("API: Attempting to fetch single job with ID: " . $job_id);
            $stmt = $conn->prepare("SELECT id, title, description, location, skills, salary, deadline, status, employment_type, experience_level FROM jobs WHERE id = ?");
            if (!$stmt) {
                error_log("API: Prepare failed for single job: " . implode(" ", $conn->errorInfo()));
                sendJsonResponse(["error" => "Failed to prepare statement for single job."], 500);
            }
            $stmt->bindParam(1, $job_id, PDO::PARAM_INT);
            $stmt->execute();
            $job = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($job) {
                error_log("API: Successfully fetched job: " . json_encode($job));
                echo json_encode($job);
            } else {
                error_log("API: Job with ID " . $job_id . " not found.");
                sendJsonResponse(["message" => "Job not found."], 404);
            }
        } else {
            // Fetch all jobs
            error_log("API: Attempting to fetch all jobs.");
            $stmt = $conn->query("SELECT id, title, location, status, employment_type FROM jobs");
            if (!$stmt) {
                error_log("API: Query failed for all jobs: " . implode(" ", $conn->errorInfo()));
                sendJsonResponse(["error" => "Failed to fetch all jobs."], 500);
            }
            $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("API: Successfully fetched " . count($jobs) . " jobs: " . json_encode($jobs));
            echo json_encode($jobs);
        }
        break;

    case 'DELETE':
        if ($job_id !== null) {
            error_log("API: Attempting to delete job with ID: " . $job_id);
            $stmt = $conn->prepare("DELETE FROM jobs WHERE id = ?");
            if (!$stmt) {
                error_log("API: Prepare failed for delete: " . implode(" ", $conn->errorInfo()));
                sendJsonResponse(["error" => "Failed to prepare statement for delete."], 500);
            }
            $stmt->bindParam(1, $job_id, PDO::PARAM_INT);
            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    error_log("API: Job " . $job_id . " deleted successfully.");
                    sendJsonResponse(["message" => "Job deleted successfully."], 200);
                } else {
                    error_log("API: Job " . $job_id . " not found for deletion.");
                    sendJsonResponse(["message" => "Job not found or already deleted."], 404);
                }
            } else {
                error_log("API: Execute failed for delete: " . implode(" ", $stmt->errorInfo()));
                sendJsonResponse(["error" => "Failed to delete job."], 500);
            }
        } else {
            error_log("API: Job ID required for DELETE operation.");
            sendJsonResponse(["error" => "Job ID required for DELETE operation."], 400);
        }
        break;

    case 'POST':
    case 'PUT':
        http_response_code(405); // Method Not Allowed
        error_log("API: Method " . $method . " not implemented for this endpoint.");
        echo json_encode(["message" => "Method not allowed."]);
        break;

    default:
        http_response_code(405); // Method Not Allowed
        error_log("API: Unknown method " . $method . " received.");
        echo json_encode(["message" => "Method not allowed."]);
        break;
}

// Connection will be closed automatically when script ends, or can be explicitly set to null
$conn = null;
?>
