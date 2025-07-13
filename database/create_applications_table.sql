-- SQL script to create the 'applications' table

CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT NOT NULL,
  `applicant_name` VARCHAR(255) NOT NULL,
  `applicant_email` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(50),
  `resume_path` VARCHAR(255),
  `application_status` VARCHAR(50) DEFAULT 'pending',
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
