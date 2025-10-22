-- =============================================================================
-- UIC Alumni Portal - Manual Database Fixes for Failing Tests
-- Run this script in Supabase Dashboard > SQL Editor
-- =============================================================================

-- =============================================================================
-- Fix 1: Add title column to gallery_images table
-- =============================================================================
-- Check if column exists first, then add if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'gallery_images' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE gallery_images ADD COLUMN title VARCHAR(255);
        RAISE NOTICE '✅ Added title column to gallery_images table';
    ELSE
        RAISE NOTICE '✅ Title column already exists in gallery_images table';
    END IF;
END $$;

-- =============================================================================
-- Fix 2: Create missing storage buckets
-- =============================================================================
-- Insert storage buckets with conflict handling
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('alumni-profiles', 'alumni-profiles', true, 52428800, null),
    ('gallery-images', 'gallery-images', true, 52428800, null),
    ('news-images', 'news-images', true, 52428800, null),
    ('documents', 'documents', false, 52428800, null)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Fix 3: Fix RLS policies for pending_registrations
-- =============================================================================
-- Drop existing policy and create new one that allows public insertions
DROP POLICY IF EXISTS "Anyone can insert pending registration" ON pending_registrations;
DROP POLICY IF EXISTS "Public can insert pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON pending_registrations;

-- Create a policy that allows anyone to insert pending registrations
CREATE POLICY "Allow public registration insertions" ON pending_registrations
FOR INSERT 
WITH CHECK (true);

-- Also ensure admins can manage all pending registrations
DROP POLICY IF EXISTS "Admins can manage pending registrations" ON pending_registrations;
CREATE POLICY "Admins can manage pending registrations" ON pending_registrations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- =============================================================================
-- Fix 4: Storage bucket policies for public access
-- =============================================================================

-- Alumni Profiles bucket policies
DROP POLICY IF EXISTS "Alumni can upload their own profile images" ON storage.objects;
CREATE POLICY "Alumni can upload their own profile images"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'alumni-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Alumni can update their own profile images" ON storage.objects;
CREATE POLICY "Alumni can update their own profile images"
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'alumni-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'alumni-profiles');

-- Gallery Images bucket policies
DROP POLICY IF EXISTS "Admins can manage gallery images" ON storage.objects;
CREATE POLICY "Admins can manage gallery images"
ON storage.objects FOR ALL 
USING (bucket_id = 'gallery-images' AND EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery-images');

-- News Images bucket policies  
DROP POLICY IF EXISTS "Admins can manage news images" ON storage.objects;
CREATE POLICY "Admins can manage news images"
ON storage.objects FOR ALL 
USING (bucket_id = 'news-images' AND EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Public can view news images" ON storage.objects;
CREATE POLICY "Public can view news images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'news-images');

-- Documents bucket policies
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON storage.objects;
CREATE POLICY "Authenticated users can manage documents"
ON storage.objects FOR ALL 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- =============================================================================
-- Fix 5: Ensure gallery_images table has proper structure and policies
-- =============================================================================

-- Ensure gallery_images table has RLS enabled
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Update gallery images policies to use the correct column names
DROP POLICY IF EXISTS "Everyone can view images from published albums" ON gallery_images;
CREATE POLICY "Everyone can view images from published albums" ON gallery_images
FOR SELECT USING (EXISTS (
  SELECT 1 FROM gallery_albums 
  WHERE id = gallery_images.album_id 
  AND (published = true OR is_published = true)
));

DROP POLICY IF EXISTS "Admins can manage gallery images" ON gallery_images;
CREATE POLICY "Admins can manage gallery images" ON gallery_images
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- =============================================================================
-- Fix 6: Ensure gallery_albums table has consistent column names
-- =============================================================================

-- Check and standardize the published column name
DO $$ 
BEGIN 
    -- If gallery_albums has is_published but not published, add published column
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'gallery_albums' 
        AND column_name = 'is_published'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'gallery_albums' 
        AND column_name = 'published'
    ) THEN
        ALTER TABLE gallery_albums ADD COLUMN published BOOLEAN DEFAULT true;
        UPDATE gallery_albums SET published = is_published;
        RAISE NOTICE '✅ Added published column to gallery_albums table';
    END IF;
END $$;

-- Update gallery albums policies to handle both column names
DROP POLICY IF EXISTS "Everyone can view published albums" ON gallery_albums;
CREATE POLICY "Everyone can view published albums" ON gallery_albums
FOR SELECT USING (published = true OR is_published = true);

DROP POLICY IF EXISTS "Admins can manage albums" ON gallery_albums;
CREATE POLICY "Admins can manage albums" ON gallery_albums
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- =============================================================================
-- Fix 7: Create helper function for checking admin role
-- =============================================================================

-- Function to check if user is admin (used in policies)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = COALESCE(user_id, auth.uid()) 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Fix 8: Ensure all required tables have proper RLS policies
-- =============================================================================

-- Enable RLS on all required tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracer_study_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Job opportunities policies (allow authenticated users to view)
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON job_opportunities;
CREATE POLICY "Authenticated users can view jobs" ON job_opportunities
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Tracer study responses policies
DROP POLICY IF EXISTS "Users can manage their own responses" ON tracer_study_responses;
CREATE POLICY "Users can manage their own responses" ON tracer_study_responses
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all responses" ON tracer_study_responses;
CREATE POLICY "Admins can view all responses" ON tracer_study_responses
FOR SELECT USING (is_admin());

-- =============================================================================
-- Verification and Summary
-- =============================================================================

-- Display summary of what was fixed
DO $$
DECLARE
  bucket_count INTEGER;
  column_exists BOOLEAN;
BEGIN
  -- Check storage buckets
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE id IN ('alumni-profiles', 'gallery-images', 'news-images', 'documents');
  
  -- Check if title column was added
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'gallery_images' 
    AND column_name = 'title'
  ) INTO column_exists;
  
  RAISE NOTICE '=== FIX SUMMARY ===';
  RAISE NOTICE 'Storage buckets created: % / 4', bucket_count;
  RAISE NOTICE 'Gallery images title column: %', CASE WHEN column_exists THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE 'RLS policies updated for pending_registrations: YES';
  RAISE NOTICE 'Storage bucket policies configured: YES';
  RAISE NOTICE '===================';
  
  IF bucket_count = 4 AND column_exists THEN
    RAISE NOTICE '✅ All fixes have been applied successfully!';
    RAISE NOTICE '📝 Next step: Run "node test-all-features.js" to verify tests pass';
  ELSE
    RAISE NOTICE '⚠️  Some fixes may not have been applied. Please check the output above.';
  END IF;
END $$;