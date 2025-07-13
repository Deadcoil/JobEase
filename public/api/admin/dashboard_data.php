<?php
require_once '../config/database.php';
header('Content-Type: application/json');

try {
    $db = getDbConnection();

    // Fetch jobs from DB
    $jobsStmt = $db->query("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5");
    $jobs = $jobsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Hardcoded job (optional)
    $jobs[] = [
        'id' => 999,
        'title' => 'Sample Job',
        'company' => 'DemoCorp',
        'location' => 'Remote',
        'status' => 'open',
        'created_at' => date('Y-m-d'),
    ];

    // Count stats
    $totalJobs = $db->query("SELECT COUNT(*) FROM jobs")->fetchColumn();
    $openJobs = $db->query("SELECT COUNT(*) FROM jobs WHERE status = 'open'")->fetchColumn();
    $totalApplications = $db->query("SELECT COUNT(*) FROM applications")->fetchColumn();
    $recentApplications = $db->query("SELECT COUNT(*) FROM applications WHERE applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();

    // Fetch recent applications
    $appsStmt = $db->query("SELECT * FROM applications ORDER BY applied_at DESC LIMIT 5");
    $applications = $appsStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'totalJobs' => $totalJobs,
        'openJobs' => $openJobs,
        'totalApplications' => $totalApplications,
        'recentApplications' => $recentApplications,
        'jobs' => $jobs,
        'applications' => $applications,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
