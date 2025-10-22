-- =============================================================================
-- UIC Alumni Portal - Final Corrected Database Fixes for Failing Tests
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
-- Fix 5: Determine and fix gallery_albums column naming
-- =============================================================================

-- First, let's determine which column exists in gallery_albums
DO $$ 
DECLARE
    has_published BOOLEAN := FALSE;
    has_is_published BOOLEAN := FALSE;
BEGIN 
    -- Check for 'published' column
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'gallery_albums' 
        AND column_name = 'published'
    ) INTO has_published;
    
    -- Check for 'is_published' column  
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'gallery_albums' 
        AND column_name = 'is_published'
    ) INTO has_is_published;

    RAISE NOTICE 'Gallery albums column status:';
    RAISE NOTICE '  published: %', CASE WHEN has_published THEN 'EXISTS' ELSE 'MISSING' END;
    RAISE NOTICE '  is_published: %', CASE WHEN has_is_published THEN 'EXISTS' ELSE 'MISSING' END;
    
    -- If neither exists, add published column
    IF NOT has_published AND NOT has_is_published THEN
        ALTER TABLE gallery_albums ADD COLUMN published BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ Added published column to gallery_albums table';
    -- If only is_published exists, add published column and sync it
    ELSIF has_is_published AND NOT has_published THEN
        ALTER TABLE gallery_albums ADD COLUMN published BOOLEAN DEFAULT true;
        UPDATE gallery_albums SET published = is_published;
        RAISE NOTICE '✅ Added published column and synced with is_published';
    -- If only published exists, we're good
    ELSIF has_published AND NOT has_is_published THEN
        RAISE NOTICE '✅ Published column already exists, no changes needed';
    -- If both exist, sync them
    ELSE
        UPDATE gallery_albums SET published = is_published;
        RAISE NOTICE '✅ Synced published with is_published';
    END IF;
END $$;

-- =============================================================================
-- Fix 6: Gallery table policies with correct column names
-- =============================================================================

-- Ensure gallery tables have RLS enabled (only for actual tables, not views)
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Update gallery albums policies - use published column (which we ensured exists above)
DROP POLICY IF EXISTS "Everyone can view published albums" ON gallery_albums;
DROP POLICY IF EXISTS "Enable read access for all users" ON gallery_albums;
CREATE POLICY "Everyone can view published albums" ON gallery_albums
FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins can manage albums" ON gallery_albums;
DROP POLICY IF EXISTS "Enable all for admin users" ON gallery_albums;
CREATE POLICY "Admins can manage albums" ON gallery_albums
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Update gallery images policies - use published column for album check
DROP POLICY IF EXISTS "Everyone can view images from published albums" ON gallery_images;
DROP POLICY IF EXISTS "Enable read access for all users on images" ON gallery_images;
CREATE POLICY "Everyone can view images from published albums" ON gallery_images
FOR SELECT USING (EXISTS (
  SELECT 1 FROM gallery_albums 
  WHERE id = gallery_images.album_id 
  AND published = true
));

DROP POLICY IF EXISTS "Admins can manage gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Enable all for admin users on images" ON gallery_images;
CREATE POLICY "Admins can manage gallery images" ON gallery_images
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
-- Fix 8: Enable RLS on tables only (skip views)
-- =============================================================================

-- Function to safely enable RLS only on actual tables
DO $$
DECLARE
    table_name TEXT;
    table_names TEXT[] := ARRAY['users', 'user_profiles', 'pending_registrations', 
                                'job_opportunities', 'tracer_study_responses', 
                                'gallery_albums', 'gallery_images'];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        -- Check if it's actually a table (not a view)
        IF EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_names[array_position(table_names, table_name)]
            AND table_type = 'BASE TABLE'
        ) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE 'Enabled RLS on table: %', table_name;
        ELSE
            RAISE NOTICE 'Skipped % (not a base table or does not exist)', table_name;
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- Fix 9: Create policies for actual tables only
-- =============================================================================

-- Job opportunities policies (only if it's a table, not a view)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'job_opportunities'
        AND table_type = 'BASE TABLE'
    ) THEN
        DROP POLICY IF EXISTS "Authenticated users can view jobs" ON job_opportunities;
        CREATE POLICY "Authenticated users can view jobs" ON job_opportunities
        FOR SELECT USING (auth.uid() IS NOT NULL);
        RAISE NOTICE 'Created job_opportunities policies';
    ELSE
        RAISE NOTICE 'Skipped job_opportunities policies (not a base table)';
    END IF;
END $$;

-- Tracer study responses policies (only if it's a table, not a view)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tracer_study_responses'
        AND table_type = 'BASE TABLE'
    ) THEN
        DROP POLICY IF EXISTS "Users can manage their own responses" ON tracer_study_responses;
        CREATE POLICY "Users can manage their own responses" ON tracer_study_responses
        FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Admins can view all responses" ON tracer_study_responses;
        CREATE POLICY "Admins can view all responses" ON tracer_study_responses
        FOR SELECT USING (is_admin());
        
        RAISE NOTICE 'Created tracer_study_responses policies';
    ELSE
        RAISE NOTICE 'Skipped tracer_study_responses policies (not a base table)';
    END IF;
END $$;

-- =============================================================================
-- Verification and Summary
-- =============================================================================

-- Display summary of what was fixed
DO $$
DECLARE
  bucket_count INTEGER;
  title_column_exists BOOLEAN;
  published_column_exists BOOLEAN;
  table_count INTEGER;
  view_count INTEGER;
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
  ) INTO title_column_exists;
  
  -- Check if published column exists
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'gallery_albums' 
    AND column_name = 'published'
  ) INTO published_column_exists;
  
  -- Count actual tables vs views
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('users', 'user_profiles', 'pending_registrations', 'news', 
                     'job_opportunities', 'tracer_study_responses', 'gallery_albums', 'gallery_images');
  
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views 
  WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_profiles', 'pending_registrations', 'news', 
                     'job_opportunities', 'tracer_study_responses', 'gallery_albums', 'gallery_images');
  
  RAISE NOTICE '=== FIX SUMMARY ===';
  RAISE NOTICE 'Storage buckets created: % / 4', bucket_count;
  RAISE NOTICE 'Gallery images title column: %', CASE WHEN title_column_exists THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE 'Gallery albums published column: %', CASE WHEN published_column_exists THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE 'Database objects found: % tables, % views', table_count, view_count;
  RAISE NOTICE 'RLS policies updated for pending_registrations: YES';
  RAISE NOTICE 'Storage bucket policies configured: YES';
  RAISE NOTICE 'Gallery table policies updated: YES';
  RAISE NOTICE '==================';
  
  IF bucket_count = 4 AND title_column_exists AND published_column_exists THEN
    RAISE NOTICE '✅ All fixes have been applied successfully!';
    RAISE NOTICE '📝 Next step: Run "node test-all-features.js" to verify tests pass';
  ELSE
    RAISE NOTICE '⚠️  Some fixes may not have been applied. Please check the output above.';
  END IF;
END $$;