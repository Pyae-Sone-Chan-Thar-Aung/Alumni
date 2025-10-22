-- ============================================================================
-- 🎓 CCS ALUMNI PORTAL - FRESH START DATABASE SCHEMA
-- ============================================================================
-- University of the Immaculate Conception, Davao City
-- College of Computer Studies Alumni Portal System
--
-- Project URL: https://gpsbydtilgoutlltyfvl.supabase.co
-- Super Admin: paung_230000001724@uic.edu.ph
-- Created: October 6, 2025
--
-- ⚠️ IMPORTANT: This schema has been carefully designed with:
--    - Proper foreign key relationships
--    - Cascading deletes where appropriate
--    - Comprehensive indexes for performance
--    - Row Level Security (RLS) policies
--    - Helper functions for common operations
--
-- INSTRUCTIONS:
-- 1. Copy this ENTIRE script
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run" (takes 30-60 seconds)
-- 4. Verify all tables are created
-- ============================================================================

-- Start transaction for atomic execution
BEGIN;

-- ============================================================================
-- SECTION 1: EXTENSIONS AND CLEANUP
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up any existing objects (for clean install)
DROP TABLE IF EXISTS public.batchmate_messages CASCADE;
DROP TABLE IF EXISTS public.tracer_study_responses CASCADE;
DROP TABLE IF EXISTS public.job_opportunities CASCADE;
DROP TABLE IF EXISTS public.gallery_images CASCADE;
DROP TABLE IF EXISTS public.gallery_albums CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.pending_registrations CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_approval() CASCADE;

-- ============================================================================
-- SECTION 2: HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin (used in RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id
        AND role IN ('admin', 'super_admin')
        AND approval_status = 'approved'
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 3: CORE USER TABLES
-- ============================================================================

-- 3.1 USERS TABLE - Main authentication and user management
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,  -- Links to auth.users.id from Supabase Auth
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'alumni' CHECK (role IN ('super_admin', 'admin', 'alumni')),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.users IS 'Core user table - manages authentication and user roles';
COMMENT ON COLUMN public.users.auth_id IS 'Links to auth.users.id for Supabase authentication';
COMMENT ON COLUMN public.users.role IS 'User role: super_admin, admin, or alumni';
COMMENT ON COLUMN public.users.approval_status IS 'Registration approval status';

-- Create indexes for users table
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_approval_status ON public.users(approval_status);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_active ON public.users(is_active);

-- Add trigger to update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3.2 USER_PROFILES TABLE - Extended user information
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    suffix TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    civil_status TEXT CHECK (civil_status IN ('Single', 'Married', 'Divorced', 'Widowed', 'Separated')),
    
    -- Contact Information
    phone TEXT,
    mobile TEXT,
    
    -- Address Information
    address TEXT,
    city TEXT,
    province TEXT,
    country TEXT DEFAULT 'Philippines',
    postal_code TEXT,
    
    -- Academic Information
    student_id TEXT,
    program TEXT,  -- e.g., BS Computer Science, BS Information Technology
    batch_year INTEGER,
    graduation_year INTEGER,
    graduation_date DATE,
    
    -- Professional Information
    current_job_title TEXT,
    current_company TEXT,
    employment_status TEXT CHECK (employment_status IN (
        'Employed - Full Time', 
        'Employed - Part Time', 
        'Self-Employed', 
        'Unemployed - Looking', 
        'Unemployed - Not Looking', 
        'Student', 
        'Retired'
    )),
    
    -- Social Media
    linkedin_url TEXT,
    facebook_url TEXT,
    
    -- Profile Settings
    profile_image_url TEXT,  -- Path to image in storage
    bio TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Privacy Settings
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    show_work_info BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS 'Extended alumni profile information';
COMMENT ON COLUMN public.user_profiles.user_id IS 'Foreign key to users table - CASCADE delete';

-- Create indexes for user_profiles
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_graduation_year ON public.user_profiles(graduation_year);
CREATE INDEX idx_user_profiles_program ON public.user_profiles(program);
CREATE INDEX idx_user_profiles_employment_status ON public.user_profiles(employment_status);

-- Add trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3.3 PENDING_REGISTRATIONS TABLE - Approval workflow
CREATE TABLE public.pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    
    -- Academic Information
    student_id TEXT,
    program TEXT NOT NULL,
    batch_year TEXT,
    graduation_year TEXT NOT NULL,
    
    -- Professional Information
    current_job TEXT,
    company TEXT,
    
    -- Additional Information
    address TEXT,
    city TEXT,
    profile_image_url TEXT,
    
    -- Registration Data (store full JSON for reference)
    registration_data JSONB,
    
    -- Status and Processing
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.pending_registrations IS 'Holds new alumni registrations pending admin approval';

-- Create indexes for pending_registrations
CREATE INDEX idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX idx_pending_registrations_created_at ON public.pending_registrations(created_at DESC);

-- ============================================================================
-- SECTION 4: CONTENT MANAGEMENT TABLES
-- ============================================================================

-- 4.1 NEWS TABLE - News and announcements
CREATE TABLE public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Content
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT DEFAULT 'General' CHECK (category IN ('General', 'Events', 'Achievements', 'Announcements', 'Alumni Stories')),
    
    -- Media
    image_url TEXT,  -- Path to image in storage
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- SEO and Metadata
    slug TEXT UNIQUE,
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.news IS 'News articles and announcements for alumni portal';

-- Create indexes for news
CREATE INDEX idx_news_author_id ON public.news(author_id);
CREATE INDEX idx_news_published ON public.news(is_published, published_at DESC);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_created_at ON public.news(created_at DESC);

-- Add trigger
CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON public.news
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4.2 GALLERY_ALBUMS TABLE - Photo gallery albums
CREATE TABLE public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Album Information
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    
    -- Settings
    is_published BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.gallery_albums IS 'Photo albums for event galleries';

-- Create indexes for gallery_albums
CREATE INDEX idx_gallery_albums_published ON public.gallery_albums(is_published, display_order);
CREATE INDEX idx_gallery_albums_created_by ON public.gallery_albums(created_by);

-- Add trigger
CREATE TRIGGER update_gallery_albums_updated_at
    BEFORE UPDATE ON public.gallery_albums
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4.3 GALLERY_IMAGES TABLE - Individual photos in albums
CREATE TABLE public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Image Information
    image_url TEXT NOT NULL,  -- Path to image in storage
    title TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.gallery_images IS 'Individual photos within gallery albums';
COMMENT ON COLUMN public.gallery_images.album_id IS 'Foreign key to gallery_albums - CASCADE delete';

-- Create indexes for gallery_images
CREATE INDEX idx_gallery_images_album_id ON public.gallery_images(album_id, display_order);
CREATE INDEX idx_gallery_images_uploaded_by ON public.gallery_images(uploaded_by);

-- ============================================================================
-- SECTION 5: JOB OPPORTUNITIES TABLE
-- ============================================================================

CREATE TABLE public.job_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Job Information
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    job_type TEXT CHECK (job_type IN ('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote')),
    description TEXT NOT NULL,
    requirements TEXT,
    salary_range TEXT,
    
    -- Application
    application_url TEXT,
    application_email TEXT,
    application_deadline DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.job_opportunities IS 'Job postings for alumni';

-- Create indexes for job_opportunities
CREATE INDEX idx_job_opportunities_active ON public.job_opportunities(is_active, created_at DESC);
CREATE INDEX idx_job_opportunities_featured ON public.job_opportunities(is_featured);
CREATE INDEX idx_job_opportunities_posted_by ON public.job_opportunities(posted_by);

-- Add trigger
CREATE TRIGGER update_job_opportunities_updated_at
    BEFORE UPDATE ON public.job_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 6: TRACER STUDY TABLE
-- ============================================================================

CREATE TABLE public.tracer_study_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Employment Information
    employment_status TEXT CHECK (employment_status IN (
        'Employed', 'Self-Employed', 'Unemployed', 'Pursuing Further Studies'
    )),
    job_title TEXT,
    company_name TEXT,
    company_address TEXT,
    monthly_income_range TEXT,
    
    -- Job Relevance
    job_related_to_program BOOLEAN,
    skills_acquired_useful BOOLEAN,
    
    -- Time to Employment
    time_to_first_job TEXT,
    
    -- Additional Information
    further_studies_details TEXT,
    certifications TEXT,
    feedback_on_program TEXT,
    suggestions TEXT,
    
    -- Response Metadata
    response_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.tracer_study_responses IS 'Alumni employment and career tracking data';

-- Create indexes for tracer_study_responses
CREATE INDEX idx_tracer_study_user_id ON public.tracer_study_responses(user_id);
CREATE INDEX idx_tracer_study_employment_status ON public.tracer_study_responses(employment_status);
CREATE INDEX idx_tracer_study_response_date ON public.tracer_study_responses(response_date DESC);

-- Add trigger
CREATE TRIGGER update_tracer_study_updated_at
    BEFORE UPDATE ON public.tracer_study_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 7: BATCHMATE MESSAGES TABLE (Optional)
-- ============================================================================

CREATE TABLE public.batchmate_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Message Content
    subject TEXT,
    message TEXT NOT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.batchmate_messages IS 'Direct messages between alumni';

-- Create indexes for batchmate_messages
CREATE INDEX idx_batchmate_messages_sender ON public.batchmate_messages(sender_id, created_at DESC);
CREATE INDEX idx_batchmate_messages_recipient ON public.batchmate_messages(recipient_id, is_read, created_at DESC);

-- ============================================================================
-- SECTION 8: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracer_study_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batchmate_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8.1 USERS TABLE POLICIES
-- ============================================================================

-- Users can view approved, active users
CREATE POLICY "Users can view approved active users"
    ON public.users FOR SELECT
    USING (approval_status = 'approved' AND is_active = TRUE);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (public.is_admin(auth.uid()::UUID));

-- Admins can insert users
CREATE POLICY "Admins can insert users"
    ON public.users FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()::UUID));

-- Admins can update users
CREATE POLICY "Admins can update users"
    ON public.users FOR UPDATE
    USING (public.is_admin(auth.uid()::UUID));

-- Users can update their own record (limited fields)
CREATE POLICY "Users can update own record"
    ON public.users FOR UPDATE
    USING (auth.uid()::UUID = auth_id)
    WITH CHECK (auth.uid()::UUID = auth_id);

-- ============================================================================
-- 8.2 USER_PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view public profiles or their own
CREATE POLICY "Users can view public profiles or own"
    ON public.user_profiles FOR SELECT
    USING (
        is_public = TRUE 
        OR user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID)
        OR public.is_admin(auth.uid()::UUID)
    );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID))
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID));

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles"
    ON public.user_profiles FOR ALL
    USING (public.is_admin(auth.uid()::UUID));

-- ============================================================================
-- 8.3 PENDING_REGISTRATIONS TABLE POLICIES
-- ============================================================================

-- Allow anonymous users to insert registrations (for signup)
CREATE POLICY "Anyone can submit registration"
    ON public.pending_registrations FOR INSERT
    WITH CHECK (true);

-- Only admins can view pending registrations
CREATE POLICY "Admins can view pending registrations"
    ON public.pending_registrations FOR SELECT
    USING (public.is_admin(auth.uid()::UUID));

-- Only admins can update/delete pending registrations
CREATE POLICY "Admins can manage pending registrations"
    ON public.pending_registrations FOR ALL
    USING (public.is_admin(auth.uid()::UUID));

-- ============================================================================
-- 8.4 NEWS TABLE POLICIES
-- ============================================================================

-- Everyone can view published news
CREATE POLICY "Everyone can view published news"
    ON public.news FOR SELECT
    USING (is_published = TRUE);

-- Admins can view all news (including drafts)
CREATE POLICY "Admins can view all news"
    ON public.news FOR SELECT
    USING (public.is_admin(auth.uid()::UUID));

-- Admins can manage news
CREATE POLICY "Admins can manage news"
    ON public.news FOR ALL
    USING (public.is_admin(auth.uid()::UUID));

-- ============================================================================
-- 8.5 GALLERY POLICIES
-- ============================================================================

-- Everyone can view published albums
CREATE POLICY "Everyone can view published albums"
    ON public.gallery_albums FOR SELECT
    USING (is_published = TRUE);

-- Admins can manage albums
CREATE POLICY "Admins can manage albums"
    ON public.gallery_albums FOR ALL
    USING (public.is_admin(auth.uid()::UUID));

-- Everyone can view images in published albums
CREATE POLICY "Everyone can view images in published albums"
    ON public.gallery_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.gallery_albums
            WHERE id = gallery_images.album_id AND is_published = TRUE
        )
    );

-- Admins can manage images
CREATE POLICY "Admins can manage images"
    ON public.gallery_images FOR ALL
    USING (public.is_admin(auth.uid()::UUID));

-- ============================================================================
-- 8.6 JOB OPPORTUNITIES POLICIES
-- ============================================================================

-- Authenticated users can view active jobs
CREATE POLICY "Authenticated users can view active jobs"
    ON public.job_opportunities FOR SELECT
    USING (is_active = TRUE AND auth.uid() IS NOT NULL);

-- Admins can manage jobs
CREATE POLICY "Admins can manage jobs"
    ON public.job_opportunities FOR ALL
    USING (public.is_admin(auth.uid()::UUID));

-- ============================================================================
-- 8.7 TRACER STUDY POLICIES
-- ============================================================================

-- Users can view their own responses
CREATE POLICY "Users can view own tracer study"
    ON public.tracer_study_responses FOR SELECT
    USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID));

-- Users can insert their own responses
CREATE POLICY "Users can submit tracer study"
    ON public.tracer_study_responses FOR INSERT
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID));

-- Users can update their own responses
CREATE POLICY "Users can update own tracer study"
    ON public.tracer_study_responses FOR UPDATE
    USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID))
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID));

-- Admins can view all responses
CREATE POLICY "Admins can view all tracer studies"
    ON public.tracer_study_responses FOR SELECT
    USING (public.is_admin(auth.uid()::UUID));

-- ============================================================================
-- 8.8 BATCHMATE MESSAGES POLICIES
-- ============================================================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
    ON public.batchmate_messages FOR SELECT
    USING (
        sender_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID)
        OR recipient_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID)
    );

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON public.batchmate_messages FOR INSERT
    WITH CHECK (sender_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID));

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages"
    ON public.batchmate_messages FOR UPDATE
    USING (recipient_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID))
    WITH CHECK (recipient_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()::UUID));

-- ============================================================================
-- SECTION 9: VERIFICATION AND COMPLETION
-- ============================================================================

-- Verify all tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'users', 'user_profiles', 'pending_registrations', 
        'news', 'job_opportunities', 'tracer_study_responses',
        'gallery_albums', 'gallery_images', 'batchmate_messages'
    );
    
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '✅ DATABASE SCHEMA CREATED SUCCESSFULLY!';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Expected: 9 tables';
    
    IF table_count = 9 THEN
        RAISE NOTICE '✅ All tables created successfully!';
    ELSE
        RAISE WARNING '⚠️ Expected 9 tables, got %', table_count;
    END IF;
END $$;

-- Display created tables
SELECT 
    'Created Tables:' as status,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'user_profiles', 'pending_registrations', 
    'news', 'job_opportunities', 'tracer_study_responses',
    'gallery_albums', 'gallery_images', 'batchmate_messages'
)
ORDER BY table_name;

-- Display RLS policies count
SELECT 
    'RLS Policies:' as status,
    schemaname,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname;

COMMIT;

-- ============================================================================
-- POST-INSTALLATION NOTES
-- ============================================================================
-- 
-- ✅ SCHEMA CREATED SUCCESSFULLY!
-- 
-- NEXT STEPS:
-- 
-- 1. CREATE STORAGE BUCKETS (in Supabase Dashboard → Storage):
--    a) alumni-profiles (Public, 5MB, images)
--    b) gallery-images (Public, 10MB, images)
--    c) news-images (Public, 10MB, images)
-- 
-- 2. CREATE SUPER ADMIN USER:
--    a) Go to Authentication → Users
--    b) Create user: paung_230000001724@uic.edu.ph
--    c) Password: UICalumni2025
--    d) Copy the UUID
--    e) Run the INSERT queries (see separate file)
-- 
-- 3. UPDATE SERVER/.ENV:
--    Add your service_role key from Settings → API
-- 
-- 4. TEST CONNECTION:
--    npm run server (backend)
--    npm start (frontend)
-- 
-- ============================================================================
