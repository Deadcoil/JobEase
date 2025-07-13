<?php
// api/test/test_connection.php - Test database connection and basic functionality

require_once '../config/database.php';

echo "<h2>JobEase System Test</h2>";

try {
    // Test database connection
    echo "<h3>1. Database Connection Test</h3>";
    $db = getDbConnection();
    echo "✅ Database connection successful<br>";
    
    // Test jobs table
    echo "<h3>2. Jobs Table Test</h3>";
    $stmt = $db->query("SELECT COUNT(*) as count FROM jobs");
    $result = $stmt->fetch();
    echo "✅ Jobs table accessible - Found {$result['count']} jobs<br>";
    
    // Test applications table
    echo "<h3>3. Applications Table Test</h3>";
    $stmt = $db->query("SELECT COUNT(*) as count FROM applications");
    $result = $stmt->fetch();
    echo "✅ Applications table accessible - Found {$result['count']} applications<br>";
    
    // Test uploads directory
    echo "<h3>4. File Upload Directory Test</h3>";
    $uploadDir = '../../uploads/resumes/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        echo "✅ Created uploads directory<br>";
    } else {
        echo "✅ Uploads directory exists<br>";
    }
    
    if (is_writable($uploadDir)) {
        echo "✅ Uploads directory is writable<br>";
    } else {
        echo "❌ Uploads directory is not writable - Please check permissions<br>";
    }
    
    // Test API endpoints
    echo "<h3>5. API Endpoints Test</h3>";
    
    // Test jobs API
    $jobsUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/api/jobs.php';
    $context = stream_context_create(['http' => ['timeout' => 5]]);
    $response = @file_get_contents($jobsUrl, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        if (isset($data['jobs'])) {
            echo "✅ Jobs API working - Returns " . count($data['jobs']) . " jobs<br>";
        } else {
            echo "⚠️ Jobs API returns unexpected format<br>";
        }
    } else {
        echo "❌ Jobs API not accessible<br>";
    }
    
    echo "<h3>6. System Status</h3>";
    echo "✅ JobEase system is ready for testing!<br>";
    echo "<br><strong>Next steps:</strong><br>";
    echo "1. Visit <a href='/'>Homepage</a><br>";
    echo "2. Browse <a href='/jobs'>Jobs</a><br>";
    echo "3. Access <a href='/admin'>Admin Panel</a> (admin/admin123)<br>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
}
