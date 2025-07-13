<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// api/jobs.php - Public jobs API endpoint

require_once 'config/database.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $db = getDbConnection();
    
    // Check if specific job ID is requested
    if (isset($_GET['id'])) {
        $jobId = intval($_GET['id']);
        
        $stmt = $db->prepare("
            SELECT j.id, j.title, j.description, j.location, j.skills, j.salary, j.deadline, j.status, j.created_at,
                   j.employment_type, j.experience_level,
                   c.name as category_name, c.slug as category_slug, c.color as category_color
            FROM jobs j
            LEFT JOIN job_categories c ON j.category_id = c.id
            WHERE j.id = ? AND j.status = 'open'
        ");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();
        
        if ($job) {
            // Fetch tags for the job
            $tagsStmt = $db->prepare("
                SELECT jt.id, jt.name, jt.slug
                FROM job_tags jt
                JOIN job_tag_relations jtr ON jt.id = jtr.tag_id
                WHERE jtr.job_id = ?
            ");
            $tagsStmt->execute([$jobId]);
            $job['tags'] = $tagsStmt->fetchAll();

            // Add category object if category exists
            if ($job['category_name']) {
                $job['category'] = [
                    'name' => $job['category_name'],
                    'slug' => $job['category_slug'],
                    'color' => $job['category_color']
                ];
            }
            unset($job['category_name'], $job['category_slug'], $job['category_color']); // Clean up raw category fields
            
            sendJsonResponse(['job' => $job]);
        } else {
            sendJsonResponse(['error' => 'Job not found'], 404);
        }
    } else {
        // Get all open jobs with category and tag info
        $stmt = $db->prepare("
            SELECT j.id, j.title, j.description, j.location, j.skills, j.salary, j.deadline, j.status, j.created_at,
                   j.employment_type, j.experience_level,
                   c.name as category_name, c.slug as category_slug, c.color as category_color,
                   (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count
            FROM jobs j
            LEFT JOIN job_categories c ON j.category_id = c.id
            WHERE j.status = 'open' AND j.deadline >= CURDATE()
            ORDER BY j.created_at DESC
        ");
        $stmt->execute();
        $jobs = $stmt->fetchAll();
        
        // Add tags to each job
        foreach ($jobs as &$job) {
            $tagsStmt = $db->prepare("
                SELECT jt.id, jt.name, jt.slug
                FROM job_tags jt
                JOIN job_tag_relations jtr ON jt.id = jtr.tag_id
                WHERE jtr.job_id = ?
            ");
            $tagsStmt->execute([$job['id']]);
            $job['tags'] = $tagsStmt->fetchAll();

            // Add category object if category exists
            if ($job['category_name']) {
                $job['category'] = [
                    'name' => $job['category_name'],
                    'slug' => $job['category_slug'],
                    'color' => $job['category_color']
                ];
            }
            unset($job['category_name'], $job['category_slug'], $job['category_color']); // Clean up raw category fields
        }
        
        sendJsonResponse(['jobs' => $jobs]);
    }

} catch (Exception $e) {
    http_response_code(500);
    sendJsonResponse(['error' => $e->getMessage()], 500);
}

