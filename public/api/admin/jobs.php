<?php
// api/admin/jobs.php

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
require_once __DIR__ . '/../config/database.php';

// Get the database connection using the helper function
$conn = getDbConnection();

// Check if connection was successful
if ($conn === null) {
    http_response_code(500);
    error_log("API: Database connection failed in jobs.php after getDbConnection.");
    die(json_encode(["error" => "Database connection failed. Please check server logs."]));
}

// Determine job_id from GET parameter for GET/DELETE/PUT
$job_id = null;
if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $job_id = (int)$_GET['id'];
    error_log("API: Detected job_id from GET parameter: " . $job_id);
} else {
    error_log("API: No job ID found in GET parameter.");
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
                error_log("API: Successfully fetched single job: " . json_encode($job));
                echo json_encode($job);
            } else {
                error_log("API: Single job with ID " . $job_id . " not found.");
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

    case 'PUT':
        if ($job_id === null) {
            error_log("API: Job ID required for PUT operation.");
            sendJsonResponse(["error" => "Job ID required for PUT operation."], 400);
        }

        // Read raw input for PUT requests
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("API: Invalid JSON received for PUT: " . json_last_error_msg());
            sendJsonResponse(["error" => "Invalid JSON data."], 400);
        }

        // Validate required fields (adjust as needed)
        $required_fields = ['title', 'description', 'location', 'deadline', 'status', 'employment_type', 'experience_level'];
        $errors = [];
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' is required.';
            }
        }

        if (!empty($errors)) {
            error_log("API: Validation errors for PUT: " . implode(", ", $errors));
            sendJsonResponse(["error" => "Validation failed.", "details" => $errors], 400);
        }

        error_log("API: Attempting to update job with ID: " . $job_id . " with data: " . json_encode($data));

        $sql = "UPDATE jobs SET
                    title = :title,
                    description = :description,
                    location = :location,
                    skills = :skills,
                    salary = :salary,
                    deadline = :deadline,
                    status = :status,
                    employment_type = :employment_type,
                    experience_level = :experience_level,
                    updated_at = NOW()
                WHERE id = :id";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            error_log("API: Prepare failed for PUT: " . implode(" ", $conn->errorInfo()));
            sendJsonResponse(["error" => "Failed to prepare statement for update."], 500);
        }

        // Bind parameters
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':location', $data['location']);
        $stmt->bindParam(':skills', $data['skills']);
        $stmt->bindParam(':salary', $data['salary']);
        $stmt->bindParam(':deadline', $data['deadline']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':employment_type', $data['employment_type']);
        $stmt->bindParam(':experience_level', $data['experience_level']);
        $stmt->bindParam(':id', $job_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                error_log("API: Job " . $job_id . " updated successfully.");
                sendJsonResponse(["message" => "Job updated successfully."], 200);
            } else {
                error_log("API: Job " . $job_id . " not found or no changes made.");
                sendJsonResponse(["message" => "Job not found or no changes made."], 404);
            }
        } else {
            error_log("API: Execute failed for PUT: " . implode(" ", $stmt->errorInfo()));
            sendJsonResponse(["error" => "Failed to update job."], 500);
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
        // Create new job
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate required fields for creation
        $requiredFields = ['title', 'description', 'location', 'deadline', 'employment_type', 'experience_level', 'status'];
        $errors = validateRequiredFields($data, $requiredFields);

        if (!empty($errors)) {
            error_log("API: Validation errors for POST: " . implode(", ", $errors));
            sendJsonResponse(["error" => "Validation failed.", "details" => $errors], 400);
        }

        // Sanitize input
        $title = sanitizeInput($data['title']);
        $description = sanitizeInput($data['description']);
        $location = sanitizeInput($data['location']);
        $skills = isset($data['skills']) ? sanitizeInput($data['skills']) : null;
        $salary = isset($data['salary']) ? sanitizeInput($data['salary']) : null;
        $deadline = sanitizeInput($data['deadline']);
        $employment_type = sanitizeInput($data['employment_type']);
        $experience_level = sanitizeInput($data['experience_level']);
        $status = sanitizeInput($data['status']);

        // Validate date format and if it's in the future for 'open' status
        if (!isValidDate($deadline)) {
            error_log("API: Invalid deadline date format: " . $deadline);
            sendJsonResponse(["error" => "Invalid deadline date format. Use YYYY-MM-DD."], 400);
        }
        if ($status === 'open' && !isDateInFuture($deadline)) {
            error_log("API: Deadline must be in the future for 'open' jobs.");
            sendJsonResponse(["error" => "Deadline must be in the future for 'open' jobs."], 400);
        }

        error_log("API: Attempting to create new job.");
        $stmt = $conn->prepare("INSERT INTO jobs (title, description, location, skills, salary, deadline, employment_type, experience_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            error_log("API: Prepare failed for create: " . implode(" ", $conn->errorInfo()));
            sendJsonResponse(["error" => "Failed to prepare statement for job creation."], 500);
        }
        $stmt->bindParam(1, $title);
        $stmt->bindParam(2, $description);
        $stmt->bindParam(3, $location);
        $stmt->bindParam(4, $skills);
        $stmt->bindParam(5, $salary);
        $stmt->bindParam(6, $deadline);
        $stmt->bindParam(7, $employment_type);
        $stmt->bindParam(8, $experience_level);
        $stmt->bindParam(9, $status);

        if ($stmt->execute()) {
            $new_job_id = $conn->lastInsertId();
            error_log("API: New job created successfully with ID: " . $new_job_id);
            sendJsonResponse(["message" => "Job created successfully.", "id" => $new_job_id], 201); // 201 Created
        } else {
            error_log("API: Execute failed for create: " . implode(" ", $stmt->errorInfo()));
            sendJsonResponse(["error" => "Failed to create job."]);
        }
        break;

    default:
        http_response_code(405); // Method Not Allowed
        error_log("API: Unknown method " . $method . " received.");
        echo json_encode(["message" => "Method not allowed."]);
        break;
}

$conn = null;
?>
