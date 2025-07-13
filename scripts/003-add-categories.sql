-- Add categories and tags system
CREATE TABLE IF NOT EXISTS job_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_tag_relations (
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES job_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, tag_id)
);

-- Add category_id to jobs table
ALTER TABLE jobs ADD COLUMN category_id INTEGER REFERENCES job_categories(id);
ALTER TABLE jobs ADD COLUMN employment_type ENUM('full-time', 'part-time', 'contract', 'internship', 'remote') DEFAULT 'full-time';
ALTER TABLE jobs ADD COLUMN experience_level ENUM('entry', 'mid', 'senior', 'lead', 'executive') DEFAULT 'mid';

-- Insert default categories
INSERT INTO job_categories (name, slug, description, icon, color) VALUES
('Technology', 'technology', 'Software development, IT, and tech roles', 'code', '#3B82F6'),
('Design', 'design', 'UI/UX, graphic design, and creative roles', 'palette', '#8B5CF6'),
('Marketing', 'marketing', 'Digital marketing, content, and growth roles', 'megaphone', '#EF4444'),
('Sales', 'sales', 'Sales, business development, and account management', 'trending-up', '#10B981'),
('Finance', 'finance', 'Accounting, finance, and investment roles', 'dollar-sign', '#F59E0B'),
('Operations', 'operations', 'Operations, logistics, and project management', 'settings', '#6B7280'),
('Human Resources', 'human-resources', 'HR, recruiting, and people operations', 'users', '#EC4899'),
('Customer Support', 'customer-support', 'Customer service and support roles', 'headphones', '#14B8A6');

-- Insert common tags
INSERT INTO job_tags (name, slug) VALUES
('Remote Work', 'remote-work'),
('Flexible Hours', 'flexible-hours'),
('Health Insurance', 'health-insurance'),
('401k', '401k'),
('Stock Options', 'stock-options'),
('Unlimited PTO', 'unlimited-pto'),
('Work From Home', 'work-from-home'),
('Startup', 'startup'),
('Enterprise', 'enterprise'),
('Fast Growing', 'fast-growing');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_job_tags_usage_count ON job_tags(usage_count DESC);
