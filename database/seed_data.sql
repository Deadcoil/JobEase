-- SQL script to seed sample data into 'jobs' and 'applications' tables

-- Sample data for `jobs` table
INSERT INTO `jobs` (`title`, `description`, `location`, `skills`, `salary`, `deadline`, `employment_type`, `experience_level`, `status`) VALUES
('Senior Frontend Developer', 'Develop and maintain user-facing features using modern frontend technologies.', 'San Francisco, CA', 'React, Next.js, TypeScript, Tailwind CSS', '$120,000 - $150,000', '2025-12-31', 'full-time', 'senior', 'open'),
('Backend Engineer', 'Design and implement scalable backend services and APIs.', 'Remote', 'Node.js, Python, Go, PostgreSQL, Docker', '$110,000 - $140,000', '2025-11-15', 'full-time', 'mid', 'open'),
('Full Stack Developer', 'Work across the full stack to build and deploy web applications.', 'Bhubaneswar, IND', 'React, Node.js, MongoDB, AWS', '$80,000 - $100,000', '2025-10-01', 'full-time', 'mid', 'open'),
('DevOps Engineer', 'Automate and optimize our development and release processes.', 'Austin, TX', 'Kubernetes, AWS, CI/CD, Terraform', '$130,000 - $160,000', '2025-09-30', 'full-time', 'senior', 'open'),
('UI/UX Designer', 'Create intuitive and visually appealing user interfaces.', 'Los Angeles, CA', 'Figma, Sketch, Adobe XD, User Research', '$90,000 - $110,000', '2025-12-01', 'full-time', 'mid', 'open'),
('Senior Software Engineer', 'Lead the development of critical software components.', 'New York, NY', 'Java, Spring Boot, Microservices, Kafka', '$140,000 - $170,000', '2025-11-20', 'full-time', 'senior', 'open'),
('Data Scientist', 'Analyze complex datasets to extract actionable insights.', 'San Francisco, CA', 'Python, R, SQL, Machine Learning, TensorFlow', '$125,000 - $155,000', '2025-10-10', 'full-time', 'mid', 'open'),
('Marketing Manager', 'Develop and execute marketing strategies to drive growth.', 'Remote', 'Digital Marketing, SEO, Content Creation, Analytics', '$70,000 - $90,000', '2025-09-01', 'full-time', 'mid', 'open'),
('Operations Coordinator', 'Manage daily operations and support business functions.', 'Austin, TX', 'Logistics, Project Management, Communication', '$50,000 - $65,000', '2025-08-20', 'full-time', 'entry', 'open'),
('Fullstack Developer (Contract)', 'Short-term contract for a fullstack development project.', 'Berlin, Germany', 'Vue.js, Laravel, MySQL', '$60/hour - $80/hour', '2025-09-15', 'contract', 'mid', 'open');

-- Sample data for `applications` table
INSERT INTO `applications` (`job_id`, `applicant_name`, `applicant_email`, `phone_number`, `resume_path`, `application_status`, `applied_at`) VALUES
(1, 'Prakash Behuria', 'beingstudentloving009@gmail.com', '7439049863', NULL, 'pending', '2025-07-13 18:19:12'),
(2, 'Sohenna Chourury', 'sohennachoudhury@gmail.com', '9457825121', NULL, 'reviewed', '2025-07-13 18:20:00'),
(3, 'Subham Sethy', 'sethysubham197@gmail.com', '8260508487', NULL, 'accepted', '2025-07-13 00:22:40'),
(1, 'Jane Doe', 'jane.doe@example.com', '123-456-7890', NULL, 'pending', '2025-07-12 10:00:00'),
(4, 'John Smith', 'john.smith@example.com', '098-765-4321', NULL, 'reviewed', '2025-07-11 14:30:00'),
(5, 'Alice Johnson', 'alice.j@example.com', '555-123-4567', NULL, 'pending', '2025-07-10 09:15:00'),
(1, 'Bob Williams', 'bob.w@example.com', '111-222-3333', NULL, 'rejected', '2025-07-09 16:45:00');
