<?php

require_once __DIR__ . '/Database.php';

class Job {
    private $db;
    private $table_name = "jobs";

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll($filters = [], $pagination = []) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE 1=1";
        $params = [];

        if (!empty($filters['status'])) {
            $query .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }
        if (!empty($filters['location']) && $filters['location'] !== 'all') {
            $query .= " AND location = :location";
            $params[':location'] = $filters['location'];
        }
        if (!empty($filters['salaryRange']) && $filters['salaryRange'] !== 'all') {
            // This is a simplified salary range filter.
            // In a real app, you'd store salary as numeric values for better filtering.
            $salaryParts = explode('-', $filters['salaryRange']);
            if (count($salaryParts) === 2) {
                $min = (int)$salaryParts[0];
                $max = (int)$salaryParts[1];
                $query .= " AND CAST(REPLACE(REPLACE(salary, '$', ''), ',', '') AS UNSIGNED) BETWEEN :min_salary AND :max_salary";
                $params[':min_salary'] = $min;
                $params[':max_salary'] = $max;
            } elseif ($filters['salaryRange'] === '0-80000') {
                $query .= " AND CAST(REPLACE(REPLACE(salary, '$', ''), ',', '') AS UNSIGNED) <= 80000";
            } elseif ($filters['salaryRange'] === '120000-999999') {
                $query .= " AND CAST(REPLACE(REPLACE(salary, '$', ''), ',', '') AS UNSIGNED) >= 120000";
            }
        }
        if (!empty($filters['searchTerm'])) {
            $query .= " AND (title LIKE :search OR description LIKE :search OR skills LIKE :search)";
            $params[':search'] = '%' . $filters['searchTerm'] . '%';
        }

        $query .= " ORDER BY created_at DESC";

        // Pagination
        if (!empty($pagination['limit']) && !empty($pagination['offset'])) {
            $query .= " LIMIT :limit OFFSET :offset";
            $params[':limit'] = $pagination['limit'];
            $params[':offset'] = $pagination['offset'];
        }

        $stmt = $this->db->prepare($query);
        foreach ($params as $key => &$val) {
            // Use bindValue for integer parameters in LIMIT/OFFSET
            if (strpos($key, ':limit') !== false || strpos($key, ':offset') !== false || strpos($key, ':min_salary') !== false || strpos($key, ':max_salary') !== false) {
                $stmt->bindValue($key, $val, PDO::PARAM_INT);
            } else {
                $stmt->bindValue($key, $val);
            }
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function countAll($filters = []) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE 1=1";
        $params = [];

        if (!empty($filters['status'])) {
            $query .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }
        if (!empty($filters['location']) && $filters['location'] !== 'all') {
            $query .= " AND location = :location";
            $params[':location'] = $filters['location'];
        }
        if (!empty($filters['salaryRange']) && $filters['salaryRange'] !== 'all') {
            $salaryParts = explode('-', $filters['salaryRange']);
            if (count($salaryParts) === 2) {
                $min = (int)$salaryParts[0];
                $max = (int)$salaryParts[1];
                $query .= " AND CAST(REPLACE(REPLACE(salary, '$', ''), ',', '') AS UNSIGNED) BETWEEN :min_salary AND :max_salary";
                $params[':min_salary'] = $min;
                $params[':max_salary'] = $max;
            } elseif ($filters['salaryRange'] === '0-80000') {
                $query .= " AND CAST(REPLACE(REPLACE(salary, '$', ''), ',', '') AS UNSIGNED) <= 80000";
            } elseif ($filters['salaryRange'] === '120000-999999') {
                $query .= " AND CAST(REPLACE(REPLACE(salary, '$', ''), ',', '') AS UNSIGNED) >= 120000";
            }
        }
        if (!empty($filters['searchTerm'])) {
            $query .= " AND (title LIKE :search OR description LIKE :search OR skills LIKE :search)";
            $params[':search'] = '%' . $filters['searchTerm'] . '%';
        }

        $stmt = $this->db->prepare($query);
        foreach ($params as $key => &$val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " (title, description, location, skills, salary, deadline, status) VALUES (:title, :description, :location, :skills, :salary, :deadline, :status)";
        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':location', $data['location']);
        $stmt->bindParam(':skills', $data['skills']);
        $stmt->bindParam(':salary', $data['salary']);
        $stmt->bindParam(':deadline', $data['deadline']);
        $stmt->bindParam(':status', $data['status']);

        return $stmt->execute();
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . " SET title = :title, description = :description, location = :location, skills = :skills, salary = :salary, deadline = :deadline, status = :status WHERE id = :id";
        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':location', $data['location']);
        $stmt->bindParam(':skills', $data['skills']);
        $stmt->bindParam(':salary', $data['salary']);
        $stmt->bindParam(':deadline', $data['deadline']);
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function getUniqueLocations() {
        $query = "SELECT DISTINCT location FROM " . $this->table_name . " WHERE status = 'open' ORDER BY location ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}