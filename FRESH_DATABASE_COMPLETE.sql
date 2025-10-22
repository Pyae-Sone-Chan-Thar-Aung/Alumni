-- ===================================================================
-- COMPLETE CCS ALUMNI PORTAL DATABASE SCHEMA - FRESH INSTALLATION
-- ===================================================================
-- Run this on a CLEAN database (after dropping all existing tables)
-- This script creates everything needed for the CCS Alumni Portal
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
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
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

-- Drop existing triggers first
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

-- 8.2: USER_PROFILES policies
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON public.user_profiles FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8.3: PENDING_REGISTRATIONS policies
CREATE POLICY "Admins can view pending registrations"
ON public.pending_registrations FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage pending registrations"
ON public.pending_registrations FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8.4: NEWS policies
CREATE POLICY "Anyone can view published news"
ON public.news FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage news"
ON public.news FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8.5: GALLERY_ALBUMS policies
CREATE POLICY "Anyone can view published albums"
ON public.gallery_albums FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage albums"
ON public.gallery_albums FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8.6: GALLERY_IMAGES policies
CREATE POLICY "Anyone can view gallery images"
ON public.gallery_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.gallery_albums
        WHERE id = gallery_images.album_id AND is_published = true
    )
);

CREATE POLICY "Admins can manage gallery images"
ON public.gallery_images FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8.7: JOB_OPPORTUNITIES policies
CREATE POLICY "Anyone can view active jobs"
ON public.job_opportunities FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage jobs"
ON public.job_opportunities FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8.8: TRACER_STUDY_RESPONSES policies
CREATE POLICY "Users can view own tracer response"
ON public.tracer_study_responses FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert own tracer response"
ON public.tracer_study_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracer response"
ON public.tracer_study_responses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tracer responses"
ON public.tracer_study_responses FOR SELECT
USING (public.is_admin(auth.uid()));

-- ===================================================================
-- SECTION 9: GRANT PERMISSIONS
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
-- SECTION 10: SEED DATA
-- ===================================================================

-- Insert main admin user
-- Note: Password is managed by Supabase Auth, not this table
-- After registration, this user will be automatically promoted to admin
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    approval_status,
    is_verified,
    approved_at,
    registration_date,
    created_at
) VALUES (
    gen_random_uuid(),
    'paung_230000001724@uic.edu.ph',
    'Main',
    'Administrator',
    'admin',
    'approved',
    true,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    approval_status = 'approved',
    is_verified = true,
    approved_at = NOW();

-- Insert system admin user (backup)
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    approval_status,
    is_verified,
    approved_at,
    registration_date,
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
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    approval_status = 'approved',
    is_verified = true,
    approved_at = NOW();

-- ===================================================================
-- SECTION 11: VALIDATION
-- ===================================================================

-- Check all tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    tbl_name TEXT;
    table_count INTEGER := 0;
BEGIN
    FOR tbl_name IN 
        SELECT unnest(ARRAY[
            'users', 'user_profiles', 'pending_registrations', 'news', 
            'job_opportunities', 'tracer_study_responses', 'gallery_albums', 
            'gallery_images'
        ])
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = tbl_name
        ) THEN
            table_count := table_count + 1;
            RAISE NOTICE '✓ Table exists: %', tbl_name;
        ELSE
            missing_tables := array_append(missing_tables, tbl_name);
            RAISE WARNING '✗ Missing table: %', tbl_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE WARNING 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ SUCCESS! All % tables created!', table_count;
        RAISE NOTICE '========================================';
    END IF;
END $$;

-- Display table counts
SELECT 
    'DATABASE SETUP COMPLETE!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) as total_functions,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies;

-- ===================================================================
-- INSTALLATION COMPLETE!
-- ===================================================================
-- Next Steps:
-- 1. Create storage buckets: alumni-profiles, gallery-images, news-images
-- 2. Configure storage policies via Supabase Dashboard
-- 3. Register first user and promote to admin
-- 4. Test all features
-- ===================================================================
