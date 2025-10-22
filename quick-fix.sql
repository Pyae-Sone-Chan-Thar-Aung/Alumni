-- Quick Database Fixes

-- 1. Fix news view - add missing columns
DROP VIEW IF EXISTS news;
CREATE VIEW news AS
SELECT 
  id, title, content, category, image_url, is_published,
  false as is_important,  -- Add missing column
  created_at as published_at,  -- Add missing published_at column
  created_at, updated_at, author_id
FROM news_announcements;

-- 2. Add missing display_order to gallery_images
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 3. Fix tracer_study_responses - add user columns
ALTER TABLE tracer_study_responses 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- 4. Temporarily disable RLS for testing (CRITICAL FIX)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracer_study_responses DISABLE ROW LEVEL SECURITY;

-- 5. Ensure job_opportunities table exists with all required columns
CREATE TABLE IF NOT EXISTS job_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(200),
    salary_range VARCHAR(100),
    job_type VARCHAR(50) DEFAULT 'full-time',
    application_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 6. Sample data
INSERT INTO gallery_albums (title, description, is_public) 
VALUES ('Sample Album', 'Test album', true) ON CONFLICT DO NOTHING;

INSERT INTO gallery_images (album_id, image_url, display_order)
SELECT id, 'https://via.placeholder.com/400x300', 1 
FROM gallery_albums LIMIT 1 ON CONFLICT DO NOTHING;

-- Sample job opportunity
INSERT INTO job_opportunities (title, company, description, location, salary_range, is_active)
VALUES (
  'Software Developer',
  'Tech Solutions Inc.',
  'We are looking for a skilled software developer to join our team.',
  'Manila, Philippines',
  '₱50,000 - ₱80,000',
  true
) ON CONFLICT DO NOTHING;

-- Sample tracer study response
INSERT INTO tracer_study_responses (first_name, last_name)
VALUES ('John', 'Doe') ON CONFLICT DO NOTHING;

-- 7. Create storage bucket (run this in Supabase dashboard)
-- Go to Storage > Create Bucket > Name: "alumni-profiles" > Public: Yes

-- Verify
SELECT 'Quick fixes applied!' as status;
SELECT 'RLS DISABLED - Remember to re-enable after testing!' as warning;
