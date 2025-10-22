-- Fix Database Schema Issues
-- Run this SQL script in your Supabase SQL Editor to fix all the reported errors

-- 1. Fix news table name issue (app expects 'news' but we have 'news_announcements')
-- Create a view to map the table
CREATE OR REPLACE VIEW news AS
SELECT 
  id,
  title,
  content,
  category,
  image_url,
  is_published,
  created_at,
  updated_at,
  author_id
FROM news_announcements;

-- 2. Add missing display_order column to gallery_images table
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing records with display_order
UPDATE gallery_images 
SET display_order = COALESCE(
  (SELECT COUNT(*) FROM gallery_images gi2 WHERE gi2.album_id = gallery_images.album_id AND gi2.created_at <= gallery_images.created_at),
  0
) 
WHERE display_order = 0;

-- 3. Fix tracer_study_responses table to include user relationship
-- Check if we need to add user relationship columns
ALTER TABLE tracer_study_responses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- If the table doesn't have proper user data, we'll need to add some sample data
-- First, let's make sure we have the required columns for tracer study
ALTER TABLE tracer_study_responses 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS program VARCHAR(100),
ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS current_job VARCHAR(200),
ADD COLUMN IF NOT EXISTS company VARCHAR(200),
ADD COLUMN IF NOT EXISTS salary_range VARCHAR(50),
ADD COLUMN IF NOT EXISTS job_satisfaction INTEGER,
ADD COLUMN IF NOT EXISTS skills_acquired TEXT[],
ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- 4. Create missing tables if they don't exist

-- Ensure gallery_albums table exists with proper structure
CREATE TABLE IF NOT EXISTS gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure gallery_images table exists with proper structure (matches production schema)
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert sample data for testing

-- Sample gallery album
INSERT INTO gallery_albums (title, description, is_public, created_by)
SELECT 
  'CCS Events 2024',
  'Photos from various CCS events and activities',
  true,
  u.id
FROM users u 
WHERE u.role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample gallery images
INSERT INTO gallery_images (album_id, image_url, caption, display_order)
SELECT 
  ga.id,
  'https://via.placeholder.com/800x600/8B0000/FFFFFF?text=CCS+Event',
  'Sample Event Photo',
  1
FROM gallery_albums ga 
WHERE ga.title = 'CCS Events 2024'
ON CONFLICT DO NOTHING;

-- Sample news (using the news_announcements table)
INSERT INTO news_announcements (title, content, category, is_published, author_id)
SELECT 
  'Welcome to CCS Alumni Portal',
  'We are excited to launch the new CCS Alumni Portal. Stay connected with your fellow alumni and discover new opportunities.',
  'announcement',
  true,
  u.id
FROM users u 
WHERE u.role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO news_announcements (title, content, category, is_published, author_id)
SELECT 
  'Alumni Networking Event',
  'Join us for our upcoming alumni networking event. Connect with fellow graduates and expand your professional network.',
  'event',
  true,
  u.id
FROM users u 
WHERE u.role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample job opportunities
INSERT INTO job_opportunities (title, company, description, requirements, location, salary_range, is_active, posted_by)
SELECT 
  'Software Developer',
  'Tech Solutions Inc.',
  'We are looking for a skilled software developer to join our team.',
  'Bachelor''s degree in Computer Science, 2+ years experience',
  'Manila, Philippines',
  '₱50,000 - ₱80,000',
  true,
  u.id
FROM users u 
WHERE u.role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample tracer study response
INSERT INTO tracer_study_responses (
  first_name, last_name, email, graduation_year, program, 
  employment_status, current_job, company, salary_range, 
  job_satisfaction, recommendations
)
VALUES (
  'John', 'Doe', 'john.doe@example.com', 2023, 'BS Computer Science',
  'Employed', 'Software Engineer', 'Tech Corp', '₱60,000 - ₱80,000',
  5, 'The program provided excellent foundation in programming and problem-solving.'
)
ON CONFLICT DO NOTHING;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_display_order ON gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_news_announcements_published ON news_announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_active ON job_opportunities(is_active);
CREATE INDEX IF NOT EXISTS idx_tracer_study_responses_graduation_year ON tracer_study_responses(graduation_year);

-- 7. Update RLS policies for new tables
-- Enable RLS on gallery tables
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Gallery albums policies
DROP POLICY IF EXISTS "Public can view published albums" ON gallery_albums;
CREATE POLICY "Public can view published albums" ON gallery_albums
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Admins can manage all albums" ON gallery_albums;
CREATE POLICY "Admins can manage all albums" ON gallery_albums
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Gallery images policies
DROP POLICY IF EXISTS "Public can view images in public albums" ON gallery_images;
CREATE POLICY "Public can view images in public albums" ON gallery_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gallery_albums 
      WHERE gallery_albums.id = gallery_images.album_id 
      AND gallery_albums.is_public = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage all images" ON gallery_images;
CREATE POLICY "Admins can manage all images" ON gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Verification queries
SELECT 'Schema fixes completed successfully!' as status;

-- Check if all tables exist
SELECT 
  'Tables check:' as check_type,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'news_announcements') THEN '✅' ELSE '❌' END as news_announcements,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'news') THEN '✅' ELSE '❌' END as news_view,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery_albums') THEN '✅' ELSE '❌' END as gallery_albums,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery_images') THEN '✅' ELSE '❌' END as gallery_images,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_opportunities') THEN '✅' ELSE '❌' END as job_opportunities,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tracer_study_responses') THEN '✅' ELSE '❌' END as tracer_study_responses;

-- Check column existence
SELECT 
  'Columns check:' as check_type,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_images' AND column_name = 'display_order') THEN '✅' ELSE '❌' END as display_order_column,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_images' AND column_name = 'caption') THEN '✅' ELSE '❌' END as caption_column,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tracer_study_responses' AND column_name = 'first_name') THEN '✅' ELSE '❌' END as tracer_first_name;

-- Show sample data counts
SELECT 
  'Sample data:' as check_type,
  (SELECT COUNT(*) FROM news_announcements) as news_count,
  (SELECT COUNT(*) FROM gallery_albums) as albums_count,
  (SELECT COUNT(*) FROM gallery_images) as images_count,
  (SELECT COUNT(*) FROM job_opportunities) as jobs_count,
  (SELECT COUNT(*) FROM tracer_study_responses) as tracer_count;
