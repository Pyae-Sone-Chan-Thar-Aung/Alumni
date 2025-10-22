-- ===================================================================
-- COMPLETE CCS ALUMNI PORTAL DATABASE SCHEMA
-- ===================================================================
-- This script creates ALL required tables, columns, RLS policies,
-- functions, triggers, and storage buckets for the CCS Alumni Portal
-- 
-- INSTRUCTIONS:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Ensure you have proper admin access
-- 3. Run the entire script at once
-- ===================================================================

-- ===================================================================
-- SECTION 1: CORE USER MANAGEMENT TABLES
-- ===================================================================

-- 1.1: USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni')),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
    -- Add columns that might be missing
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni'));
END $$;

-- 1.2: USER_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    course TEXT,
    batch_year INTEGER,
    graduation_year INTEGER,
    current_job TEXT,
    company TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Philippines',
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to user_profiles
DO $$
BEGIN
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS course TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS batch_year INTEGER;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS current_job TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS company TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Philippines';
    ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
END $$;

-- 1.3: PENDING_REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    course TEXT,
    batch_year TEXT,
    graduation_year TEXT,
    current_job TEXT,
    company TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    profile_image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ===================================================================
-- SECTION 2: CONTENT MANAGEMENT TABLES
-- ===================================================================

-- 2.1: NEWS TABLE
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Announcement',
    is_important BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    author TEXT DEFAULT 'Alumni Office',
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to news table
DO $$
BEGIN
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Announcement';
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.news ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Alumni Office';
END $$;

-- 2.2: GALLERY_ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    event_date DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to gallery_albums
DO $$
BEGIN
    ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS event_date DATE;
    ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
END $$;

-- 2.3: GALLERY_IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to gallery_images
DO $$
BEGIN
    ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS caption TEXT;
    ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
END $$;

-- ===================================================================
-- SECTION 3: JOB OPPORTUNITIES TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.job_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    description TEXT,
    requirements TEXT,
    job_type TEXT DEFAULT 'Full-time',
    application_url TEXT,
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    company_logo_url TEXT,
    posted_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to job_opportunities
DO $$
BEGIN
    ALTER TABLE public.job_opportunities ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT 'Full-time';
    ALTER TABLE public.job_opportunities ADD COLUMN IF NOT EXISTS application_url TEXT;
    ALTER TABLE public.job_opportunities ADD COLUMN IF NOT EXISTS application_deadline DATE;
    ALTER TABLE public.job_opportunities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    ALTER TABLE public.job_opportunities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.job_opportunities ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
    ALTER TABLE public.job_opportunities ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
END $$;

-- ===================================================================
-- SECTION 4: TRACER STUDY TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.tracer_study_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    sex TEXT,
    civil_status TEXT,
    
    -- Educational Background
    degree TEXT,
    major TEXT,
    graduation_year INTEGER,
    honors TEXT,
    
    -- Employment Information
    employment_status TEXT,
    company_name TEXT,
    job_title TEXT,
    industry TEXT,
    work_location TEXT,
    monthly_salary TEXT,
    employment_type TEXT,
    
    -- Job Search & Career
    first_job_related BOOLEAN,
    job_search_duration TEXT,
    job_search_method TEXT,
    started_job_search TEXT,
    
    -- Skills & Curriculum
    curriculum_helpful BOOLEAN,
    important_skills TEXT,
    additional_training TEXT,
    
    -- Feedback & Suggestions
    program_satisfaction TEXT,
    university_preparation TEXT,
    suggestions TEXT,
    recommend_program BOOLEAN,
    
    -- Gender field (for analytics)
    gender TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to tracer_study_responses
DO $$
BEGIN
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS sex TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS civil_status TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS degree TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS major TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS honors TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS employment_status TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS company_name TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS job_title TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS industry TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS work_location TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS monthly_salary TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS employment_type TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS first_job_related BOOLEAN;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS job_search_duration TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS job_search_method TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS started_job_search TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS curriculum_helpful BOOLEAN;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS important_skills TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS additional_training TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS program_satisfaction TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS university_preparation TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS suggestions TEXT;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS recommend_program BOOLEAN;
    ALTER TABLE public.tracer_study_responses ADD COLUMN IF NOT EXISTS gender TEXT;
END $$;

-- ===================================================================
-- SECTION 5: INDEXES FOR PERFORMANCE
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON public.users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_user_id ON public.pending_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_published ON public.gallery_albums(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON public.gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_active ON public.job_opportunities(is_active);
CREATE INDEX IF NOT EXISTS idx_tracer_study_user_id ON public.tracer_study_responses(user_id);

-- ===================================================================
-- SECTION 6: HELPER FUNCTIONS
-- ===================================================================

-- 6.1: is_admin() function
-- Drop all existing versions of is_admin function first
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin(user_uuid UUID);
DROP FUNCTION IF EXISTS public.is_admin(user_id UUID);

-- Create new is_admin function with consistent signature
CREATE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- 6.2: Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 6.3: Sync user approval status function
CREATE OR REPLACE FUNCTION public.sync_user_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.approval_status = 'approved' THEN
        NEW.is_verified = TRUE;
        NEW.approved_at = COALESCE(NEW.approved_at, NOW());
    ELSE
        NEW.is_verified = FALSE;
        NEW.approved_at = NULL;
    END IF;
    RETURN NEW;
END;
$$;

-- ===================================================================
-- SECTION 7: TRIGGERS
-- ===================================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_news_updated_at ON public.news;
DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON public.gallery_albums;
DROP TRIGGER IF EXISTS update_job_opportunities_updated_at ON public.job_opportunities;
DROP TRIGGER IF EXISTS update_tracer_study_updated_at ON public.tracer_study_responses;
DROP TRIGGER IF EXISTS trigger_sync_user_approval ON public.users;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON public.news
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_albums_updated_at
    BEFORE UPDATE ON public.gallery_albums
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_opportunities_updated_at
    BEFORE UPDATE ON public.job_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracer_study_updated_at
    BEFORE UPDATE ON public.tracer_study_responses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_sync_user_approval
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_approval();

-- ===================================================================
-- SECTION 8: ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- 8.1: Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracer_study_responses ENABLE ROW LEVEL SECURITY;

-- Note: users table RLS is intentionally disabled to allow registration
-- You can enable it later if needed, but it may block new registrations

-- 8.2: Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view pending registrations" ON public.pending_registrations;
DROP POLICY IF EXISTS "Admins can manage pending registrations" ON public.pending_registrations;
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
DROP POLICY IF EXISTS "Anyone can view published albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Admins can manage albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Anyone can view gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can manage gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.job_opportunities;
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.job_opportunities;
DROP POLICY IF EXISTS "Users can view own tracer response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can insert own tracer response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can update own tracer response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Admins can view all tracer responses" ON public.tracer_study_responses;

-- 8.3: USER_PROFILES policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 8.4: PENDING_REGISTRATIONS policies
CREATE POLICY "Admins can view pending registrations" ON public.pending_registrations
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage pending registrations" ON public.pending_registrations
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 8.5: NEWS policies
CREATE POLICY "Anyone can view published news" ON public.news
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage news" ON public.news
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 8.6: GALLERY_ALBUMS policies
CREATE POLICY "Anyone can view published albums" ON public.gallery_albums
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage albums" ON public.gallery_albums
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 8.7: GALLERY_IMAGES policies
CREATE POLICY "Anyone can view gallery images" ON public.gallery_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.gallery_albums
            WHERE id = gallery_images.album_id AND is_published = true
        )
    );

CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 8.8: JOB_OPPORTUNITIES policies
CREATE POLICY "Anyone can view active jobs" ON public.job_opportunities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage jobs" ON public.job_opportunities
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 8.9: TRACER_STUDY_RESPONSES policies
CREATE POLICY "Users can view own tracer response" ON public.tracer_study_responses
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert own tracer response" ON public.tracer_study_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracer response" ON public.tracer_study_responses
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tracer responses" ON public.tracer_study_responses
    FOR SELECT USING (public.is_admin(auth.uid()));

-- ===================================================================
-- SECTION 9: STORAGE BUCKETS
-- ===================================================================

-- Note: Storage buckets must be created via Supabase Dashboard UI
-- This is a reference for what buckets you need:
-- 1. 'alumni-profiles' - for profile images (public, 5MB limit)
-- 2. 'gallery-images' - for gallery images (public, 10MB limit)
-- 3. 'news-images' - for news article images (public, 5MB limit)

-- Storage policies must also be configured via Dashboard:
-- For 'alumni-profiles' bucket:
--   - SELECT: public
--   - INSERT: authenticated users
--   - UPDATE: authenticated users (own files)
--   - DELETE: authenticated users (own files) + admins

-- ===================================================================
-- SECTION 10: GRANT PERMISSIONS
-- ===================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_registrations TO authenticated;
GRANT SELECT ON public.news TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT SELECT ON public.gallery_albums TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
GRANT SELECT ON public.gallery_images TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT SELECT ON public.job_opportunities TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.job_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tracer_study_responses TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_approval TO authenticated;

-- ===================================================================
-- SECTION 11: SEED DATA
-- ===================================================================

-- Insert default admin if not exists
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    approval_status,
    is_verified,
    approved_at,
    created_at
) VALUES (
    gen_random_uuid(),
    'admin@uic.edu.ph',
    'System',
    'Administrator',
    'admin',
    'approved',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    approval_status = 'approved',
    is_verified = true;

-- Update existing published_at for news if null
UPDATE public.news 
SET published_at = created_at 
WHERE is_published = true AND published_at IS NULL;

-- Update registration_date for existing users if null
UPDATE public.users 
SET registration_date = created_at 
WHERE registration_date IS NULL;

-- ===================================================================
-- SECTION 12: VALIDATION & DIAGNOSTICS
-- ===================================================================

-- Check for missing tables
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'users', 'user_profiles', 'pending_registrations', 'news', 
            'job_opportunities', 'tracer_study_responses', 'gallery_albums', 
            'gallery_images'
        ])
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'WARNING: Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ SUCCESS: All required tables exist!';
    END IF;
END $$;

-- ===================================================================
-- SCRIPT COMPLETION
-- ===================================================================

SELECT 
    'DATABASE SCHEMA SETUP COMPLETED SUCCESSFULLY!' as status,
    'All tables, indexes, functions, triggers, and policies have been created.' as message,
    NOW() as completed_at;

-- ===================================================================
-- IMPORTANT NEXT STEPS:
-- ===================================================================
-- 1. Create storage buckets in Supabase Dashboard:
--    - alumni-profiles (public, 5MB limit)
--    - gallery-images (public, 10MB limit)
--    - news-images (public, 5MB limit)
--
-- 2. Configure storage policies for each bucket via Dashboard
--
-- 3. Test the application with new user registration
--
-- 4. Verify all features are working:
--    - Registration & Login
--    - Profile Management
--    - Tracer Study
--    - Job Opportunities
--    - Gallery
--    - News & Announcements
--    - Admin Dashboard
-- ===================================================================
