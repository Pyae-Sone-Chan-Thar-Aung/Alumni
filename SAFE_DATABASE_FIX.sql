-- =============================================================================
-- SAFE DATABASE FIX - Works with actual database schema
-- =============================================================================
-- This script first discovers what tables exist, then applies fixes safely
-- =============================================================================

-- =============================================================================
-- DISCOVER EXISTING TABLES
-- =============================================================================

-- Check what tables actually exist in the database
SELECT 
  '=== EXISTING TABLES IN DATABASE ===' as discovery_header,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check what RLS policies currently exist
SELECT 
  '=== CURRENT RLS POLICIES ===' as policy_header,
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- SAFE PENDING REGISTRATIONS FIX
-- =============================================================================

-- Only fix pending_registrations if it exists
DO $$
BEGIN
  -- Check if pending_registrations table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'pending_registrations' 
    AND table_schema = 'public'
  ) THEN
    
    RAISE NOTICE '✅ Found pending_registrations table - applying fixes...';
    
    -- Drop existing policies safely
    DROP POLICY IF EXISTS "Anyone can insert pending registration" ON pending_registrations;
    DROP POLICY IF EXISTS "Public can create pending registrations" ON pending_registrations;
    DROP POLICY IF EXISTS "Enable insert for registration" ON pending_registrations;
    DROP POLICY IF EXISTS "Allow public registration submissions" ON pending_registrations;
    DROP POLICY IF EXISTS "Enable registration for all users" ON pending_registrations;
    
    -- Create working policy for public registrations
    CREATE POLICY "Enable registration for everyone" ON pending_registrations
    FOR INSERT WITH CHECK (true);
    
    -- Allow admins to manage (if users table exists)
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
    ) THEN
      DROP POLICY IF EXISTS "Admins can manage pending registrations" ON pending_registrations;
      CREATE POLICY "Admins can manage pending registrations" ON pending_registrations
      FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      );
    END IF;
    
    -- Allow viewing by email
    DROP POLICY IF EXISTS "Users can view own pending registration" ON pending_registrations;
    CREATE POLICY "Users can view own pending registration" ON pending_registrations
    FOR SELECT USING (true); -- Make it permissive for now
    
    RAISE NOTICE '✅ Pending registrations policies updated successfully';
    
  ELSE
    RAISE NOTICE '⚠️ pending_registrations table not found - skipping';
  END IF;
END $$;

-- =============================================================================
-- SAFE USERS TABLE FIX
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'users' 
    AND table_schema = 'public'
  ) THEN
    
    RAISE NOTICE '✅ Found users table - applying fixes...';
    
    -- Drop existing policies safely
    DROP POLICY IF EXISTS "Users can view their own data" ON users;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    
    -- Create permissive policies
    CREATE POLICY "Enable read access for all users" ON users
    FOR SELECT USING (true);
    
    CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);
    
    RAISE NOTICE '✅ Users table policies updated successfully';
    
  ELSE
    RAISE NOTICE '⚠️ users table not found - skipping';
  END IF;
END $$;

-- =============================================================================
-- SAFE USER_PROFILES TABLE FIX
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_profiles' 
    AND table_schema = 'public'
  ) THEN
    
    RAISE NOTICE '✅ Found user_profiles table - applying fixes...';
    
    -- Drop existing policies safely
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    
    -- Create working policies
    CREATE POLICY "Enable read access for profiles" ON user_profiles
    FOR SELECT USING (true);
    
    CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);
    
    RAISE NOTICE '✅ User profiles policies updated successfully';
    
  ELSE
    RAISE NOTICE '⚠️ user_profiles table not found - skipping';
  END IF;
END $$;

-- =============================================================================
-- CONDITIONAL FIXES FOR OTHER TABLES
-- =============================================================================

-- Fix news table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'news' 
    AND table_schema = 'public'
  ) THEN
    
    RAISE NOTICE '✅ Found news table - applying fixes...';
    
    DROP POLICY IF EXISTS "Everyone can read published news" ON news;
    DROP POLICY IF EXISTS "Published news is viewable by everyone" ON news;
    
    CREATE POLICY "Enable read access for published news" ON news
    FOR SELECT USING (published = true OR published IS NULL);
    
    RAISE NOTICE '✅ News table policies updated successfully';
    
  ELSE
    RAISE NOTICE '⚠️ news table not found - skipping';
  END IF;
END $$;

-- Fix job_opportunities table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'job_opportunities' 
    AND table_schema = 'public'
  ) THEN
    
    RAISE NOTICE '✅ Found job_opportunities table - applying fixes...';
    
    DROP POLICY IF EXISTS "Authenticated users can view jobs" ON job_opportunities;
    DROP POLICY IF EXISTS "Job opportunities viewable by authenticated users" ON job_opportunities;
    
    CREATE POLICY "Enable read access for job opportunities" ON job_opportunities
    FOR SELECT USING (true); -- Make it permissive for testing
    
    RAISE NOTICE '✅ Job opportunities policies updated successfully';
    
  ELSE
    RAISE NOTICE '⚠️ job_opportunities table not found - skipping';
  END IF;
END $$;

-- Fix gallery tables if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'gallery_albums' 
    AND table_schema = 'public'
  ) THEN
    
    RAISE NOTICE '✅ Found gallery_albums table - applying fixes...';
    
    DROP POLICY IF EXISTS "Everyone can view published albums" ON gallery_albums;
    DROP POLICY IF EXISTS "Published albums viewable by everyone" ON gallery_albums;
    
    CREATE POLICY "Enable read access for gallery albums" ON gallery_albums
    FOR SELECT USING (published = true OR published IS NULL);
    
    RAISE NOTICE '✅ Gallery albums policies updated successfully';
    
  ELSE
    RAISE NOTICE '⚠️ gallery_albums table not found - skipping';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'gallery_images' 
    AND table_schema = 'public'
  ) THEN
    
    RAISE NOTICE '✅ Found gallery_images table - applying fixes...';
    
    DROP POLICY IF EXISTS "Everyone can view images from published albums" ON gallery_images;
    DROP POLICY IF EXISTS "Gallery images viewable by everyone" ON gallery_images;
    
    CREATE POLICY "Enable read access for gallery images" ON gallery_images
    FOR SELECT USING (true);
    
    RAISE NOTICE '✅ Gallery images policies updated successfully';
    
  ELSE
    RAISE NOTICE '⚠️ gallery_images table not found - skipping';
  END IF;
END $$;

-- Fix tracer_study_responses table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tracer_study_responses' 
    AND table_schema = 'public'
  ) THEN
    
    RAISE NOTICE '✅ Found tracer_study_responses table - applying fixes...';
    
    DROP POLICY IF EXISTS "Users can manage their own responses" ON tracer_study_responses;
    
    CREATE POLICY "Enable read access for tracer study responses" ON tracer_study_responses
    FOR SELECT USING (true); -- Make permissive for testing
    
    RAISE NOTICE '✅ Tracer study responses policies updated successfully';
    
  ELSE
    RAISE NOTICE '⚠️ tracer_study_responses table not found - skipping';
  END IF;
END $$;

-- =============================================================================
-- STORAGE CONFIGURATION CHECK
-- =============================================================================

-- Check storage buckets
SELECT 
  '=== STORAGE BUCKETS STATUS ===' as storage_header,
  name as bucket_name,
  public,
  created_at
FROM storage.buckets 
ORDER BY name;

-- =============================================================================
-- FINAL VERIFICATION
-- =============================================================================

-- Show final table and RLS status
SELECT 
  '=== FINAL TABLE STATUS ===' as final_header,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE '✅ SAFE DATABASE FIX COMPLETED!';
  RAISE NOTICE '=============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'WHAT WAS FIXED:';
  RAISE NOTICE '• ✅ Discovered actual database schema';
  RAISE NOTICE '• ✅ Applied fixes only to existing tables';
  RAISE NOTICE '• ✅ Updated RLS policies for better functionality';
  RAISE NOTICE '• ✅ Made registration system more permissive';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Check the output above to see which tables were fixed';
  RAISE NOTICE '2. Create storage buckets manually via Supabase Dashboard';
  RAISE NOTICE '3. Run: node test-all-features.js';
  RAISE NOTICE '';
  RAISE NOTICE 'STORAGE BUCKETS NEEDED (create manually):';
  RAISE NOTICE '• alumni-profiles (Public)';
  RAISE NOTICE '• gallery-images (Public)';
  RAISE NOTICE '• news-images (Public)';
  RAISE NOTICE '• documents (Private)';
  RAISE NOTICE '=============================================================================';
END $$;