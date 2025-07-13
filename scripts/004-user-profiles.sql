-- User profiles and application tracking
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    bio TEXT,
    skills TEXT,
    experience_level ENUM('entry', 'mid', 'senior', 'lead', 'executive') DEFAULT 'mid',
    resume_url TEXT,
    resume_filename VARCHAR(255),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    github_url VARCHAR(500),
    preferred_job_types TEXT, -- JSON array of preferred employment types
    preferred_locations TEXT, -- JSON array of preferred locations
    salary_expectation_min INT,
    salary_expectation_max INT,
    availability_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    profile_visibility ENUM('public', 'private', 'employers_only') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add user_profile_id to applications table
ALTER TABLE applications ADD COLUMN user_profile_id INTEGER REFERENCES user_profiles(id);

-- Application status tracking
CREATE TABLE IF NOT EXISTS application_status_history (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    status ENUM('submitted', 'reviewed', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'rejected', 'withdrawn') NOT NULL,
    notes TEXT,
    changed_by VARCHAR(100), -- admin username or system
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job alerts/saved jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_profile_id, job_id)
);

CREATE TABLE IF NOT EXISTS job_alerts (
    id SERIAL PRIMARY KEY,
    user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
    alert_name VARCHAR(255) NOT NULL,
    search_criteria TEXT, -- JSON object with search filters
    frequency ENUM('immediate', 'daily', 'weekly') DEFAULT 'daily',
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for profile management
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_profile_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_applications_user_profile_id ON applications(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_application_status_history_application_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_profile_id ON saved_jobs(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_profile_id ON job_alerts(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Add default status for existing applications
INSERT INTO application_status_history (application_id, status, changed_by)
SELECT id, 'submitted', 'system'
FROM applications
WHERE id NOT IN (SELECT application_id FROM application_status_history);
