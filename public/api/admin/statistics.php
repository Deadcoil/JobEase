<?php
require_once '../config/database.php';
header('Content-Type: application/json');

// Ensure only GET is allowed
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

try {
    $db = getDbConnection();

    // Applications Over Time (last 7 days)
    $stmt = $db->query("
        SELECT DATE(applied_at) AS date, COUNT(*) AS count
        FROM applications
        WHERE applied_at >= NOW() - INTERVAL 7 DAY
        GROUP BY DATE(applied_at)
        ORDER BY DATE(applied_at) ASC
    ");
    $applicationsOverTime = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Jobs by Status (open/closed)
    $stmt = $db->query("
        SELECT status, COUNT(*) AS count
        FROM jobs
        GROUP BY status
    ");
    $jobsByStatus = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Top Job Locations (top 5 by count)
    $stmt = $db->query("
        SELECT location, COUNT(*) AS count
        FROM jobs
        GROUP BY location
        ORDER BY count DESC
        LIMIT 5
    ");
    $topLocations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'applicationsOverTime' => $applicationsOverTime,
        'jobsByStatus' => $jobsByStatus,
        'topLocations' => $topLocations
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch statistics', 'message' => $e->getMessage()]);
}
