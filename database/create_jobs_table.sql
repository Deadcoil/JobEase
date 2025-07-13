-- SQL script to create the 'jobs' table

CREATE TABLE IF NOT EXISTS `jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `skills` TEXT,
  `salary` VARCHAR(100),
  `deadline` DATE NOT NULL,
  `employment_type` VARCHAR(50),
  `experience_level` VARCHAR(50),
  `status` VARCHAR(20) DEFAULT 'open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
