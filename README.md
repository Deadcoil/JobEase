# JOBEASE

Empowering Careers, Simplifying Success Every Step

![Last Commit](https://img.shields.io/badge/last--commit-today-blue) ![JavaScript Percentage](https://img.shields.io/badge/javascript-35.7%25-blue) ![Languages](https://img.shields.io/badge/languages-4-blue)

Built with the tools and technologies:

![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Autoprefixer](https://img.shields.io/badge/Autoprefixer-DD3735?style=for-the-badge&logo=autoprefixer&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-DD3735?style=for-the-badge&logo=postcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![YAML](https://img.shields.io/badge/YAML-CB171E?style=for-the-badge&logo=yaml&logoColor=white)

## Table of Contents

*   [Overview](#overview)
*   [Features Implemented](#features-implemented)
*   [Setup Instructions](#setup-instructions)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Database Setup](#database-setup)
    *   [Web Server Configuration](#web-server-configuration)
*   [Usage](#usage)
    *   [Running the Project](#running-the-project)
    *   [Admin Panel Usage](#admin-panel-usage)
*   [Testing](#testing)
*   [Known Issues](#known-issues)

## Overview

JobEase is a developer-focused toolkit for building a modern, scalable job application portal. It combines streamlined frontend styling with Tailwind CSS and Autoprefixer, along with a robust backend architecture that emphasizes maintainability and efficiency.

### Why JobEase?

This project aims to simplify the development of a feature-rich job portal by providing integrated styling, a well-structured database schema, and modular backend components. The core features include:

*   **Tailwind CSS Integration:** Seamlessly configure utility-first CSS with automatic purging for optimized performance.
*   **Modular Architecture:** Well-defined models and controllers for managing jobs, applications, and user profiles.
*   **Secure Database Management:** Centralized PDO connection and comprehensive schema setup for data integrity.
*   **Scalable Design:** Focus on maintainability and extensibility to support growing application needs.
*   **Developer-Friendly Workflow:** Clear configuration and scripts to streamline setup and development.

## Features Implemented

The following core features have been implemented in the JobEase admin panel:

*   **Admin Dashboard:** Overview of job management and applications.
*   **Job Management:**
    *   View All Job Listings.
    *   View Detailed Job Information.
    *   Edit Existing Job Listings.
    *   Delete Job Listings.
    *   Add New Job Listings.
*   **Application Management:**
    *   View All Job Applications.
    *   View Applications for a Specific Job.
    *   Basic application details (applicant name, email, phone, status, applied date).
    *   Links to view resumes (placeholder).
*   **Responsive Design:** Frontend components are designed to be responsive using Tailwind CSS.
*   **PHP Backend API:** RESTful API endpoints for managing jobs and applications using PDO for database interaction.

## Setup Instructions

### Prerequisites

This project requires the following dependencies:

*   **Programming Language:** PHP (with PDO_MySQL extension enabled)
*   **Web Server:** Apache with `mod_rewrite` enabled (or Nginx equivalent)
*   **Database:** MySQL (or compatible database)
*   **Package Manager:** Npm (for frontend dependencies, if any, and running scripts)

### Installation

Build JobEase from the source and install dependencies:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Deadcoil/JobEase
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd JobEase
    ```

3.  **Install frontend dependencies (if any):**

    Using npm:

    ```bash
    npm install
    ```

### Database Setup

1.  **Create a MySQL database:**
    Create a new database, for example, `jobease_db`.

2.  **Configure database connection:**
    Edit `api/config/database.php` with your database credentials:

    ```php
    // api/config/database.php
    // ...
    $this->host = getenv('PGHOST') ?: 'localhost'; // Or your database host
    $this->db_name = getenv('PGDATABASE') ?: 'jobease_db'; // Your database name
    $this->username = getenv('PGUSER') ?: 'root'; // Your database username
    $this->password = getenv('PGPASSWORD') ?: ''; // Your database password
    $this->port = getenv('PGPORT') ?: '3306'; // Your database port
    // ...
    ```

3.  **Run SQL scripts to create tables:**
    Execute the necessary SQL scripts (e.g., `scripts/create_jobs_table.sql`, `scripts/create_applications_table.sql`) to set up your database schema. You might need to create these files if they don't exist.

    Example for `scripts/create_jobs_table.sql`:
    ```sql
    CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        skills TEXT,
        salary VARCHAR(100),
        deadline DATE NOT NULL,
        employment_type VARCHAR(50),
        experience_level VARCHAR(50),
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

    Example for `scripts/create_applications_table.sql`:
    ```sql
    CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        applicant_name VARCHAR(255) NOT NULL,
        applicant_email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50),
        resume_path VARCHAR(255),
        application_status VARCHAR(50) DEFAULT 'pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
    ```

### Web Server Configuration

1.  **Point your web server's document root** to the `public/` directory of the project.
2.  **Ensure `mod_rewrite` is enabled** for Apache and that your `.htaccess` file is being respected (e.g., `AllowOverride All` in your Apache config). The provided `.htaccess` handles API routing.

## Usage

### Running the Project

After completing the setup, you can access the project through your web server.

*   **Admin Dashboard:** `http://localhost:8000/dashboard.html` (or your configured domain)
*   **Admin Jobs List:** `http://localhost:8000/admin/jobs.html`
*   **Admin Applications List:** `http://localhost:8000/admin/applications.html`

### Admin Panel Usage

Use these demo credentials for accessing the admin panel (if authentication is implemented):

*   **Username:** `admin`
*   **Password:** `admin123`

## Testing

JobEase uses the `{test_framework}` test framework. Run the test suite with:

Using npm:

```bash
npm test
```

## Known Issues

*   **Resume Upload:** The "View Resume" link is currently a placeholder; actual resume upload and storage functionality is not yet implemented.
*   **Application Status Update:** The "Edit Status" button for applications is a placeholder; the backend API for updating application status is not yet implemented.
*   **Client-side Validation:** Form validation on the frontend is basic and can be enhanced for a better user experience.
*   **Authentication:** User authentication for the admin panel is not yet implemented. The provided credentials are for conceptual use.

[⬆️ Return](#jobease)