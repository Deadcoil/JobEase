<?php
// api/admin/export_applications.php
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="applications.csv"');

require_once __DIR__ . '/../config/database.php';

$conn = getDbConnection();

if (!$conn) {
    http_response_code(500);
    echo "Database connection failed.";
    exit;
}

$stmt = $conn->query("
    SELECT 
        id, 
        job_id, 
        full_name, 
        email, 
        phone, 
        resume_url, 
        applied_at 
    FROM applications 
    ORDER BY applied_at DESC
");

if (!$stmt) {
    http_response_code(500);
    echo "Failed to fetch applications.";
    exit;
}

$applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Open output stream
$output = fopen('php://output', 'w');

// Output CSV column headers
fputcsv($output, ['ID', 'Job ID', 'Full Name', 'Email', 'Phone', 'Resume URL', 'Applied At']);

// Output each row
foreach ($applications as $application) {
    fputcsv($output, [
        $application['id'],
        $application['job_id'],
        $application['full_name'],
        $application['email'],
        $application['phone'],
        $application['resume_url'],
        $application['applied_at']
    ]);
}

fclose($output);
exit;
