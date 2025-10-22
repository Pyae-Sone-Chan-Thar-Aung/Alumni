-- =============================================================================
-- Targeted Database Fixes for UIC Alumni Portal
-- Based on comprehensive test results - fixes the specific issues found
-- =============================================================================

-- 1. Fix missing columns based on test failures

-- Add published column to news table (test expects this column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news' AND column_name = 'published'
  ) THEN
    ALTER TABLE news ADD COLUMN published BOOLEAN DEFAULT true;
    RAISE NOTICE '✅ Added published column to news table';
  END IF;
END $$;

-- Add published column to gallery_albums table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gallery_albums' AND column_name = 'published'
  ) THEN
    ALTER TABLE gallery_albums ADD COLUMN published BOOLEAN DEFAULT true;
    RAISE NOTICE '✅ Added published column to gallery_albums table';
  END IF;
END $$;

-- Add survey_year column to tracer_study_responses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracer_study_responses' AND column_name = 'survey_year'
  ) THEN
    ALTER TABLE tracer_study_responses ADD COLUMN survey_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);
    RAISE NOTICE '✅ Added survey_year column to tracer_study_responses table';
  END IF;
END $$;

-- Update existing records to have published = true
UPDATE news SET published = true WHERE published IS NULL;
UPDATE gallery_albums SET published = true WHERE published IS NULL;

-- Update existing tracer study records with survey year
UPDATE tracer_study_responses 
SET survey_year = EXTRACT(YEAR FROM created_at)::INTEGER 
WHERE survey_year IS NULL AND created_at IS NOT NULL;

UPDATE tracer_study_responses 
SET survey_year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER 
WHERE survey_year IS NULL;

-- 2. Fix RLS policies to allow registration without authentication

-- Allow anonymous users to insert into pending_registrations
DROP POLICY IF EXISTS "Allow anonymous registration" ON pending_registrations;
CREATE POLICY "Allow anonymous registration" ON pending_registrations
FOR INSERT WITH CHECK (true);

-- Allow public to read published news
DROP POLICY IF EXISTS "Public read published news" ON news;
CREATE POLICY "Public read published news" ON news
FOR SELECT USING (published = true);

-- Allow public to read published gallery albums
DROP POLICY IF EXISTS "Public read published albums" ON gallery_albums;  
CREATE POLICY "Public read published albums" ON gallery_albums
FOR SELECT USING (published = true);

-- Allow public to read gallery images from published albums
DROP POLICY IF EXISTS "Public read published gallery images" ON gallery_images;
CREATE POLICY "Public read published gallery images" ON gallery_images
FOR SELECT USING (EXISTS (
  SELECT 1 FROM gallery_albums 
  WHERE id = gallery_images.album_id AND published = true
));

-- 3. Create missing storage buckets

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('alumni-profiles', 'alumni-profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
  ('gallery-images', 'gallery-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif']),
  ('news-images', 'news-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif']),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- 4. Create storage policies for the buckets

-- Alumni Profiles Storage Policies
DROP POLICY IF EXISTS "Public view alumni profiles" ON storage.objects;
CREATE POLICY "Public view alumni profiles"
ON storage.objects FOR SELECT 
USING (bucket_id = 'alumni-profiles');

DROP POLICY IF EXISTS "Authenticated upload alumni profiles" ON storage.objects;
CREATE POLICY "Authenticated upload alumni profiles"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'alumni-profiles' AND auth.uid() IS NOT NULL);

-- Gallery Images Storage Policies
DROP POLICY IF EXISTS "Public view gallery images" ON storage.objects;
CREATE POLICY "Public view gallery images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Admin manage gallery images" ON storage.objects;
CREATE POLICY "Admin manage gallery images"
ON storage.objects FOR ALL
USING (bucket_id = 'gallery-images' AND EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- News Images Storage Policies
DROP POLICY IF EXISTS "Public view news images" ON storage.objects;
CREATE POLICY "Public view news images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'news-images');

DROP POLICY IF EXISTS "Admin manage news images" ON storage.objects;
CREATE POLICY "Admin manage news images"
ON storage.objects FOR ALL
USING (bucket_id = 'news-images' AND EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Documents Storage Policies
DROP POLICY IF EXISTS "Authenticated manage documents" ON storage.objects;
CREATE POLICY "Authenticated manage documents"
ON storage.objects FOR ALL
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- 5. Verify all fixes worked

DO $$
DECLARE
  news_published_col BOOLEAN;
  gallery_published_col BOOLEAN;
  tracer_survey_col BOOLEAN;
  bucket_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Check columns
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news' AND column_name = 'published'
  ) INTO news_published_col;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gallery_albums' AND column_name = 'published'
  ) INTO gallery_published_col;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracer_study_responses' AND column_name = 'survey_year'
  ) INTO tracer_survey_col;
  
  -- Check buckets
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE id IN ('alumni-profiles', 'gallery-images', 'news-images', 'documents');
  
  -- Report
  RAISE NOTICE '==========================================';
  RAISE NOTICE '🔧 TARGETED DATABASE FIX RESULTS';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'News published column: %', CASE WHEN news_published_col THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Gallery published column: %', CASE WHEN gallery_published_col THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Tracer survey_year column: %', CASE WHEN tracer_survey_col THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Storage buckets created: %/4', bucket_count;
  
  IF news_published_col AND gallery_published_col AND tracer_survey_col AND bucket_count = 4 THEN
    RAISE NOTICE '🎉 All targeted fixes completed successfully!';
    RAISE NOTICE '📝 You can now run the feature tests again.';
  ELSE
    RAISE NOTICE '⚠️  Some fixes may need additional attention.';
  END IF;
  
  RAISE NOTICE '==========================================';
END $$;

SELECT 
  'Targeted Database Fixes' as operation,
  'Completed' as status,
  NOW() as completed_at;