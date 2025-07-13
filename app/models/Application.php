<?php

require_once __DIR__ . '/Database.php';

class Application {
    private $db;
    private $table_name = "applications";

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " (job_id, full_name, email, phone, resume_url, resume_filename) VALUES (:job_id, :full_name, :email, :phone, :resume_url, :resume_filename)";
        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':job_id', $data['job_id'], PDO::PARAM_INT);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':phone', $data['phone']);
        $stmt->bindParam(':resume_url', $data['resume_url']);
        $stmt->bindParam(':resume_filename', $data['resume_filename']);

        return $stmt->execute();
    }

    public function getByJobId($job_id) {
        $query = "SELECT a.*, j.title as job_title FROM " . $this->table_name . " a JOIN jobs j ON a.job_id = j.id WHERE a.job_id = :job_id ORDER BY a.applied_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':job_id', $job_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAllApplications() {
        $query = "SELECT a.*, j.title as job_title FROM " . $this->table_name . " a JOIN jobs j ON a.job_id = j.id ORDER BY a.applied_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function checkDuplicateApplication($job_id, $email) {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE job_id = :job_id AND email = :email";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':job_id', $job_id, PDO::PARAM_INT);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }
}