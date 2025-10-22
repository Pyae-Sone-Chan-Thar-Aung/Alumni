-- ===================================================================
-- DROP ALL DATABASE OBJECTS - COMPLETE RESET
-- ===================================================================
-- WARNING: This will PERMANENTLY DELETE all data in your database
-- Use this to start completely fresh
-- Run this in your Supabase SQL Editor BEFORE running FRESH_DATABASE_COMPLETE.sql
-- ===================================================================

-- ===================================================================
-- STEP 1: DROP ALL ROW LEVEL SECURITY POLICIES
-- ===================================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE', 
            r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', r.policyname, r.schemaname, r.tablename;
    END LOOP;
END $$;

-- ===================================================================
-- STEP 2: DROP ALL TRIGGERS
-- ===================================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users CASCADE;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles CASCADE;
DROP TRIGGER IF EXISTS update_pending_registrations_updated_at ON public.pending_registrations CASCADE;
DROP TRIGGER IF EXISTS update_news_updated_at ON public.news CASCADE;
DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON public.gallery_albums CASCADE;
DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON public.gallery_images CASCADE;
DROP TRIGGER IF EXISTS update_job_opportunities_updated_at ON public.job_opportunities CASCADE;
DROP TRIGGER IF EXISTS update_tracer_study_updated_at ON public.tracer_study_responses CASCADE;
DROP TRIGGER IF EXISTS trigger_sync_user_approval ON public.users CASCADE;

-- ===================================================================
-- STEP 3: DROP ALL TABLES (with CASCADE to handle dependencies)
-- ===================================================================

DROP TABLE IF EXISTS public.tracer_study_responses CASCADE;
DROP TABLE IF EXISTS public.job_opportunities CASCADE;
DROP TABLE IF EXISTS public.gallery_images CASCADE;
DROP TABLE IF EXISTS public.gallery_albums CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.pending_registrations CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ===================================================================
-- STEP 4: DROP ALL FUNCTIONS
-- ===================================================================

DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_approval() CASCADE;

-- ===================================================================
-- STEP 5: DROP ALL INDEXES
-- ===================================================================

DROP INDEX IF EXISTS public.idx_users_email CASCADE;
DROP INDEX IF EXISTS public.idx_users_approval_status CASCADE;
DROP INDEX IF EXISTS public.idx_users_role CASCADE;
DROP INDEX IF EXISTS public.idx_user_profiles_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_pending_registrations_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_pending_registrations_status CASCADE;
DROP INDEX IF EXISTS public.idx_news_published CASCADE;
DROP INDEX IF EXISTS public.idx_news_category CASCADE;
DROP INDEX IF EXISTS public.idx_gallery_albums_published CASCADE;
DROP INDEX IF EXISTS public.idx_gallery_images_album_id CASCADE;
DROP INDEX IF EXISTS public.idx_job_opportunities_active CASCADE;
DROP INDEX IF EXISTS public.idx_tracer_study_user_id CASCADE;

-- ===================================================================
-- STEP 6: VERIFY ALL OBJECTS ARE DROPPED
-- ===================================================================

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'users', 'user_profiles', 'pending_registrations', 'news', 
        'job_opportunities', 'tracer_study_responses', 'gallery_albums', 
        'gallery_images'
    );
    
    SELECT COUNT(*) INTO function_count
    FROM pg_proc
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname IN ('is_admin', 'update_updated_at_column', 'sync_user_approval');
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DROP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Remaining tables: %', table_count;
    RAISE NOTICE 'Remaining functions: %', function_count;
    RAISE NOTICE 'Remaining policies: %', policy_count;
    
    IF table_count = 0 AND function_count = 0 AND policy_count = 0 THEN
        RAISE NOTICE '✅ Database successfully cleaned!';
    ELSE
        RAISE WARNING '⚠️ Some objects may still remain';
    END IF;
END $$;

-- ===================================================================
-- COMPLETION VERIFICATION
-- ===================================================================

SELECT 
    'DROP COMPLETE!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as remaining_tables,
    (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) as remaining_functions,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as remaining_policies;

-- ===================================================================
-- NEXT STEPS:
-- ===================================================================
-- 1. ✅ Run this script in Supabase SQL Editor
-- 2. ⏭️ Run FRESH_DATABASE_COMPLETE.sql to recreate everything
-- 3. 🗑️ Delete storage buckets manually in Supabase Dashboard:
--    - alumni-profiles
--    - gallery-images
--    - news-images
-- 4. ♻️ Recreate storage buckets using storage_setup_instructions.md
-- 5. 🔐 Delete all users in Supabase Auth (if you want a complete reset)
-- ===================================================================
