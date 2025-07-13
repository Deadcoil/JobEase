<?php
// api/applications.php - Public application submission endpoint
file_put_contents(__DIR__ . '/debug.log', print_r($_POST, true));
file_put_contents(__DIR__ . '/debug_files.log', print_r($_FILES, true));

require_once 'config/database.php';
require_once 'utils/email.php'; // For email notifications

// Set CORS headers
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

// Check if it's a file upload (multipart/form-data)
if (strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') === 0) {
    $data = $_POST; // Form fields are in $_POST
    $files = $_FILES; // Files are in $_FILES
} else {
    // For JSON payloads (if you were sending non-file data as JSON)
    $data = json_decode(file_get_contents("php://input"), true);
    $files = [];
}

$requiredFields = ['job_id', 'full_name', 'email', 'phone'];
$errors = validateRequiredFields($data, $requiredFields);

if (!empty($errors)) {
    sendJsonResponse(['error' => 'Validation failed', 'details' => $errors], 400);
}

if (!isValidEmail($data['email'])) {
    $errors[] = 'Invalid email format';
}

if (!empty($errors)) {
    sendJsonResponse(['error' => 'Validation failed', 'details' => $errors], 400);
}

$jobId = intval($data['job_id']);
$fullName = sanitizeInput($data['full_name']);
$email = sanitizeInput($data['email']);
$phoneNumber = sanitizeInput($data['phone']);
$resumeUrl = null; // Will store the URL to the uploaded resume

try {
    $db = getDbConnection();

    // Check if job exists and is open
    $stmtJob = $db->prepare("SELECT title FROM jobs WHERE id = ? AND status = 'open'");
    $stmtJob->execute([$jobId]);
    $job = $stmtJob->fetch();

    if (!$job) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        sendJsonResponse(['error' => 'Job not found or not open for applications'], 404);
    }

    // Handle resume upload
    if (isset($files['resume']) && $files['resume']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../public/uploads/resumes/';
 // Relative to api/applications.php
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Create directory if it doesn't exist
        }

        $fileTmpPath = $files['resume']['tmp_name'];
        $fileName = basename($files['resume']['name']);
        $fileSize = $files['resume']['size'];
        $fileType = $files['resume']['type'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        $allowedfileExtensions = ['pdf']; // Only allow PDF
        if (!in_array($fileExtension, $allowedfileExtensions)) {
            sendJsonResponse(['error' => 'Invalid file type. Only PDF files are allowed.'], 400);
        }

        // Max file size 5MB
        $maxFileSize = 5 * 1024 * 1024; 
        if ($fileSize > $maxFileSize) {
            sendJsonResponse(['error' => 'File size exceeds the maximum limit of 5MB.'], 400);
        }

        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $destPath)) {
            // Store the public URL path, not the server path
            $resumeUrl = '/public/uploads/resumes/' . $newFileName; // Relative to public/
        } else {
            error_log("Failed to move uploaded file: " . $files['resume']['error']);
            sendJsonResponse(['error' => 'Failed to upload resume'], 500);
        }
    } else if (isset($files['resume']) && $files['resume']['error'] !== UPLOAD_ERR_NO_FILE) {
        // Handle other upload errors
        error_log("Resume upload error: " . $files['resume']['error']);
        sendJsonResponse(['error' => 'Resume upload failed with error code: ' . $files['resume']['error']], 500);
    }
    $resumeFilename = isset($files['resume']) ? $files['resume']['name'] : null;
    $stmt = $db->prepare("
    INSERT INTO applications (
        job_id, full_name, email, phone, resume_url, resume_filename, user_profile_id, applied_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
");
try {
    $stmt->execute([
        $jobId,
        $fullName,
        $email,
        $phoneNumber,
        $resumeUrl,
        $resumeFilename,
        $userProfileId
    ]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        // Duplicate entry for (job_id, email)
        sendJsonResponse(['error' => 'You have already applied for this job.'], 409);
    } else {
        // Some other DB error
        error_log("Database error: " . $e->getMessage());
        sendJsonResponse(['error' => 'Database error occurred.'], 500);
    }
}

    // Send email notifications (simulated)
    sendApplicationConfirmationEmail($email, $job['title']);
    sendAdminNotificationEmail($job['title'], $fullName);

    sendJsonResponse(['message' => 'Application submitted successfully'], 201);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
