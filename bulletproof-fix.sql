-- =============================================================================
-- BULLETPROOF Database Fix for UIC Alumni Portal
-- Simplified syntax that definitely works
-- =============================================================================

-- Show existing schema
SELECT 'Starting database fixes...' as status;

-- =============================================================================
-- Fix 1: Add published column to news_announcements table
-- =============================================================================

DO $$
BEGIN
  -- Add published column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_announcements' AND column_name = 'published'
  ) THEN
    ALTER TABLE news_announcements ADD COLUMN published BOOLEAN DEFAULT true;
    -- Update existing records
    UPDATE news_announcements SET published = COALESCE(is_published, true);
  END IF;
END $$;

-- Recreate news view
DROP VIEW IF EXISTS news;
CREATE VIEW news AS
SELECT 
  id,
  title,
  content,
  COALESCE(published, is_published, true) as published,
  created_at,
  updated_at,
  author_id,
  category,
  image_url
FROM news_announcements;

SELECT 'Fixed news table and view' as step1_status;

-- =============================================================================
-- Fix 2: Add published column to gallery_albums table
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gallery_albums' AND column_name = 'published'
  ) THEN
    ALTER TABLE gallery_albums ADD COLUMN published BOOLEAN DEFAULT true;
    -- Update existing records
    UPDATE gallery_albums SET published = COALESCE(is_public, true);
  END IF;
END $$;

SELECT 'Fixed gallery_albums table' as step2_status;

-- =============================================================================
-- Fix 3: Add survey_year column to tracer_study_responses table
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracer_study_responses' AND column_name = 'survey_year'
  ) THEN
    ALTER TABLE tracer_study_responses ADD COLUMN survey_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Update existing records - check which timestamp column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tracer_study_responses' AND column_name = 'updated_at'
    ) THEN
      -- Use updated_at
      UPDATE tracer_study_responses 
      SET survey_year = EXTRACT(YEAR FROM updated_at)::INTEGER 
      WHERE survey_year IS NULL AND updated_at IS NOT NULL;
    END IF;
    
    -- Set current year for any remaining null values
    UPDATE tracer_study_responses 
    SET survey_year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER 
    WHERE survey_year IS NULL;
  END IF;
END $$;

SELECT 'Fixed tracer_study_responses table' as step3_status;

-- =============================================================================
-- Fix 4: Create missing storage buckets
-- =============================================================================

-- Alumni profiles bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('alumni-profiles', 'alumni-profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Gallery images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery-images', 'gallery-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- News images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('news-images', 'news-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

SELECT 'Created storage buckets' as step4_status;

-- =============================================================================
-- Fix 5: Create RLS policies
-- =============================================================================

-- Allow anonymous registration
DROP POLICY IF EXISTS "Allow anonymous registration" ON pending_registrations;
CREATE POLICY "Allow anonymous registration" ON pending_registrations
FOR INSERT WITH CHECK (true);

-- Allow public to read published news
DROP POLICY IF EXISTS "Public read published news" ON news_announcements;
CREATE POLICY "Public read published news" ON news_announcements
FOR SELECT USING (COALESCE(published, is_published, true) = true);

-- Allow public to read published gallery albums
DROP POLICY IF EXISTS "Public read published albums" ON gallery_albums;
CREATE POLICY "Public read published albums" ON gallery_albums
FOR SELECT USING (COALESCE(published, is_public, true) = true);

-- Allow public to read gallery images from published albums
DROP POLICY IF EXISTS "Public read published gallery images" ON gallery_images;
CREATE POLICY "Public read published gallery images" ON gallery_images
FOR SELECT USING (EXISTS (
  SELECT 1 FROM gallery_albums 
  WHERE id = gallery_images.album_id 
  AND COALESCE(published, is_public, true) = true
));

SELECT 'Created RLS policies' as step5_status;

-- =============================================================================
-- Fix 6: Create storage policies
-- =============================================================================

-- Alumni profiles storage
DROP POLICY IF EXISTS "Public view alumni profiles" ON storage.objects;
CREATE POLICY "Public view alumni profiles"
ON storage.objects FOR SELECT 
USING (bucket_id = 'alumni-profiles');

DROP POLICY IF EXISTS "Authenticated upload alumni profiles" ON storage.objects;
CREATE POLICY "Authenticated upload alumni profiles"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'alumni-profiles' AND auth.uid() IS NOT NULL);

-- Gallery images storage
DROP POLICY IF EXISTS "Public view gallery images storage" ON storage.objects;
CREATE POLICY "Public view gallery images storage"
ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Admin manage gallery storage" ON storage.objects;
CREATE POLICY "Admin manage gallery storage"
ON storage.objects FOR ALL
USING (bucket_id = 'gallery-images' AND EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- News images storage
DROP POLICY IF EXISTS "Public view news images storage" ON storage.objects;
CREATE POLICY "Public view news images storage"
ON storage.objects FOR SELECT 
USING (bucket_id = 'news-images');

DROP POLICY IF EXISTS "Admin manage news images storage" ON storage.objects;
CREATE POLICY "Admin manage news images storage"
ON storage.objects FOR ALL
USING (bucket_id = 'news-images' AND EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Documents storage
DROP POLICY IF EXISTS "Authenticated manage documents storage" ON storage.objects;
CREATE POLICY "Authenticated manage documents storage"
ON storage.objects FOR ALL
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

SELECT 'Created storage policies' as step6_status;

-- =============================================================================
-- Final verification
-- =============================================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'news') 
    THEN 'SUCCESS'
    ELSE 'FAILED'
  END as news_view_status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_albums' AND column_name = 'published')
    THEN 'SUCCESS'
    ELSE 'FAILED'
  END as gallery_published_status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tracer_study_responses' AND column_name = 'survey_year')
    THEN 'SUCCESS'
    ELSE 'FAILED'
  END as tracer_survey_year_status;

SELECT 
  COUNT(*) as storage_buckets_created
FROM storage.buckets
WHERE id IN ('alumni-profiles', 'gallery-images', 'news-images', 'documents');

-- Summary
SELECT 
  'Database fixes completed!' as final_status,
  'Run: node test-all-features.js to verify' as next_step,
  NOW() as completed_at;