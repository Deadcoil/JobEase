<?php
// api/jobs-advanced.php - Advanced job search with filtering, pagination, and categories

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
    
    // Get filter parameters
    $filters = [
        'search' => $_GET['search'] ?? '',
        'category' => $_GET['category'] ?? '',
        'location' => $_GET['location'] ?? '',
        'employment_type' => $_GET['employment_type'] ?? '',
        'experience_level' => $_GET['experience_level'] ?? '',
        'salary_min' => isset($_GET['salary_min']) ? intval($_GET['salary_min']) : null,
        'salary_max' => isset($_GET['salary_max']) ? intval($_GET['salary_max']) : null,
        'tags' => isset($_GET['tags']) ? explode(',', $_GET['tags']) : [],
        'date_posted' => isset($_GET['date_posted']) ? intval($_GET['date_posted']) : null,
        'sort_by' => $_GET['sort_by'] ?? 'newest',
        'page' => isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1,
        'limit' => isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 12
    ];
    
    // Build the main query
    $whereConditions = ["j.status = 'open'", "j.deadline >= CURDATE()"];
    $queryParams = [];
    $joins = [];
    
    // Add category join if needed
    $joins[] = "LEFT JOIN job_categories c ON j.category_id = c.id";
    
    // Add tags join if needed
    if (!empty($filters['tags'])) {
        $joins[] = "LEFT JOIN job_tag_relations jtr ON j.id = jtr.job_id";
        $joins[] = "LEFT JOIN job_tags jt ON jtr.tag_id = jt.id";
    }
    
    // Search filter
    if (!empty($filters['search'])) {
        $searchTerm = '%' . sanitizeInput($filters['search']) . '%';
        $whereConditions[] = "(j.title LIKE ? OR j.description LIKE ? OR j.skills LIKE ?)";
        $queryParams = array_merge($queryParams, [$searchTerm, $searchTerm, $searchTerm]);
    }
    
    // Category filter
    if (!empty($filters['category'])) {
        $whereConditions[] = "c.slug = ?";
        $queryParams[] = sanitizeInput($filters['category']);
    }
    
    // Location filter
    if (!empty($filters['location'])) {
        $whereConditions[] = "j.location LIKE ?";
        $queryParams[] = '%' . sanitizeInput($filters['location']) . '%';
    }
    
    // Employment type filter
    if (!empty($filters['employment_type'])) {
        $whereConditions[] = "j.employment_type = ?";
        $queryParams[] = sanitizeInput($filters['employment_type']);
    }
    
    // Experience level filter
    if (!empty($filters['experience_level'])) {
        $whereConditions[] = "j.experience_level = ?";
        $queryParams[] = sanitizeInput($filters['experience_level']);
    }
    
    // Salary filters
    if ($filters['salary_min'] !== null) {
        $whereConditions[] = "CAST(SUBSTRING_INDEX(REPLACE(j.salary, '$', ''), '-', 1) AS UNSIGNED) >= ?";
        $queryParams[] = intval($filters['salary_min']);
    }
    
    if ($filters['salary_max'] !== null) {
        $whereConditions[] = "CAST(SUBSTRING_INDEX(REPLACE(j.salary, '$', ''), '-', -1) AS UNSIGNED) <= ?";
        $queryParams[] = intval($filters['salary_max']);
    }
    
    // Tags filter
    if (!empty($filters['tags'])) {
        $tagPlaceholders = str_repeat('?,', count($filters['tags']) - 1) . '?';
        $whereConditions[] = "jt.slug IN ($tagPlaceholders)";
        $queryParams = array_merge($queryParams, $filters['tags']);
    }
    
    // Date posted filter
    if ($filters['date_posted'] !== null) {
        $whereConditions[] = "j.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)";
        $queryParams[] = intval($filters['date_posted']);
    }
    
    // Build ORDER BY clause
    $orderBy = "j.created_at DESC"; // default
    switch ($filters['sort_by']) {
        case 'oldest':
            $orderBy = "j.created_at ASC";
            break;
        case 'salary_high':
            $orderBy = "CAST(SUBSTRING_INDEX(REPLACE(j.salary, '$', ''), '-', -1) AS UNSIGNED) DESC";
            break;
        case 'salary_low':
            $orderBy = "CAST(SUBSTRING_INDEX(REPLACE(j.salary, '$', ''), '-', 1) AS UNSIGNED) ASC";
            break;
        case 'deadline':
            $orderBy = "j.deadline ASC";
            break;
        case 'relevance':
            if (!empty($filters['search'])) {
                $orderBy = "MATCH(j.title, j.description) AGAINST(? IN NATURAL LANGUAGE MODE) DESC";
                $queryParams[] = sanitizeInput($filters['search']);
            }
            break;
    }
    
    // Calculate pagination
    $offset = ($filters['page'] - 1) * $filters['limit'];
    
    // Build the complete query
    $baseQuery = "
        SELECT DISTINCT j.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
               (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count
        FROM jobs j
        " . implode(' ', $joins) . "
        WHERE " . implode(' AND ', $whereConditions) . "
        ORDER BY $orderBy
        LIMIT ? OFFSET ?
    ";
    
    $queryParams[] = $filters['limit'];
    $queryParams[] = $offset;
    
    // Execute main query
    $stmt = $db->prepare($baseQuery);
    $stmt->execute($queryParams);
    $jobs = $stmt->fetchAll();
    
    // Get total count for pagination
    $countQuery = "
        SELECT COUNT(DISTINCT j.id) as total
        FROM jobs j
        " . implode(' ', $joins) . "
        WHERE " . implode(' AND ', $whereConditions);
    
    $countParams = array_slice($queryParams, 0, -2); // Remove limit and offset
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute($countParams);
    $totalCount = $countStmt->fetch()['total'];
    
    // Get categories with job counts
    $categoriesStmt = $db->prepare("
        SELECT c.*, COUNT(j.id) as job_count
        FROM job_categories c
        LEFT JOIN jobs j ON c.id = j.category_id AND j.status = 'open' AND j.deadline >= CURDATE()
        GROUP BY c.id
        ORDER BY c.name
    ");
    $categoriesStmt->execute();
    $categories = $categoriesStmt->fetchAll();
    
    // Get popular tags
    $tagsStmt = $db->prepare("
        SELECT jt.*, COUNT(jtr.job_id) as usage_count
        FROM job_tags jt
        JOIN job_tag_relations jtr ON jt.id = jtr.tag_id
        JOIN jobs j ON jtr.job_id = j.id
        WHERE j.status = 'open' AND j.deadline >= CURDATE()
        GROUP BY jt.id
        ORDER BY usage_count DESC
        LIMIT 20
    ");
    $tagsStmt->execute();
    $popularTags = $tagsStmt->fetchAll();
    
    // Add tags to each job
    foreach ($jobs as &$job) {
        $tagStmt = $db->prepare("
            SELECT jt.*
            FROM job_tags jt
            JOIN job_tag_relations jtr ON jt.id = jtr.tag_id
            WHERE jtr.job_id = ?
        ");
        $tagStmt->execute([$job['id']]);
        $job['tags'] = $tagStmt->fetchAll();
        
        // Add category info
        if ($job['category_name']) {
            $job['category'] = [
                'name' => $job['category_name'],
                'slug' => $job['category_slug'],
                'color' => $job['category_color']
            ];
        }
        unset($job['category_name'], $job['category_slug'], $job['category_color']);
    }
    
    $totalPages = ceil($totalCount / $filters['limit']);
    
    sendJsonResponse([
        'jobs' => $jobs,
        'total' => intval($totalCount),
        'page' => $filters['page'],
        'limit' => $filters['limit'],
        'total_pages' => $totalPages,
        'categories' => $categories,
        'popular_tags' => $popularTags,
        'filters_applied' => array_filter($filters, function($value) {
            return $value !== '' && $value !== null && $value !== [];
        })
    ]);

} catch (Exception $e) {
    error_log("Advanced Jobs API error: " . $e->getMessage());
    sendJsonResponse(['error' => 'Failed to fetch jobs'], 500);
}

function sanitizeInput($input) {
    // Implement sanitization logic here
    return htmlspecialchars(trim($input));
}

function sendJsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
}
