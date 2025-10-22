-- ============================================================================
-- 🚀 CCS ALUMNI PORTAL - COMPLETE DATABASE SCHEMA 2024
-- ============================================================================
-- University of the Immaculate Conception, Davao City
-- College of Computer Studies - Alumni Portal System
--
-- Project URL: https://cnjdmddqwfryvqnhirkb.supabase.co
-- Version: 2.0.0 (Updated for new Supabase project)
-- Last Updated: January 2024
--
-- INSTRUCTIONS:
-- 1. Copy and paste this ENTIRE script into your Supabase SQL Editor
-- 2. Execute the script as a single transaction
-- 3. Verify all tables and policies are created successfully
-- 4. Follow the post-installation steps at the bottom
-- ============================================================================

-- Start transaction
BEGIN;

-- ============================================================================
-- SECTION 1: EXTENSIONS AND INITIAL SETUP
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing objects if they exist (for clean reinstall)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users CASCADE;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles CASCADE;
DROP TRIGGER IF EXISTS update_news_updated_at ON public.news CASCADE;
DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON public.gallery_albums CASCADE;
DROP TRIGGER IF EXISTS update_job_opportunities_updated_at ON public.job_opportunities CASCADE;
DROP TRIGGER IF EXISTS update_tracer_study_updated_at ON public.tracer_study_responses CASCADE;
DROP TRIGGER IF EXISTS trigger_sync_user_approval ON public.users CASCADE;

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_approval() CASCADE;

-- ============================================================================
-- SECTION 2: CORE USER MANAGEMENT TABLES
-- ============================================================================

-- 2.1 USERS TABLE - Core user authentication and roles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID, -- Reference to auth.users.id when using Supabase Auth
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni', 'super_admin')),
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata
    registration_ip INET,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    password_reset_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

-- Add indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON public.users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);

-- 2.2 USER_PROFILES TABLE - Extended user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    suffix TEXT,
    nickname TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    civil_status TEXT CHECK (civil_status IN ('Single', 'Married', 'Divorced', 'Widowed', 'Separated')),
    nationality TEXT DEFAULT 'Filipino',
    religion TEXT,
    
    -- Contact Information
    phone TEXT,
    mobile TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    
    -- Address Information
    address TEXT,
    barangay TEXT,
    city TEXT,
    province TEXT,
    region TEXT,
    country TEXT DEFAULT 'Philippines',
    postal_code TEXT,
    
    -- Academic Information
    student_id TEXT,
    program TEXT, -- Renamed from course for clarity
    major TEXT,
    minor TEXT,
    batch_year INTEGER,
    graduation_year INTEGER,
    graduation_date DATE,
    gpa DECIMAL(3,2),
    latin_honor TEXT CHECK (latin_honor IN ('Summa Cum Laude', 'Magna Cum Laude', 'Cum Laude', 'Dean''s Lister')),
    thesis_title TEXT,
    adviser_name TEXT,
    
    -- Professional Information
    current_job_title TEXT,
    current_company TEXT,
    company_address TEXT,
    industry TEXT,
    employment_status TEXT CHECK (employment_status IN (
        'Employed - Full Time', 'Employed - Part Time', 'Self-Employed', 
        'Unemployed - Looking', 'Unemployed - Not Looking', 'Student', 'Retired'
    )),
    work_experience_years INTEGER,
    monthly_income_range TEXT,
    job_related_to_program BOOLEAN,
    
    -- Social Media & Web Presence
    linkedin_url TEXT,
    facebook_url TEXT,
    twitter_url TEXT,
    instagram_url TEXT,
    personal_website TEXT,
    github_url TEXT,
    
    -- Profile Settings
    profile_image_url TEXT,
    cover_image_url TEXT,
    bio TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    allow_contact BOOLEAN DEFAULT TRUE,
    allow_job_notifications BOOLEAN DEFAULT TRUE,
    allow_event_notifications BOOLEAN DEFAULT TRUE,
    
    -- Privacy Settings
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    show_address BOOLEAN DEFAULT FALSE,
    show_work_info BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_graduation_year ON public.user_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_user_profiles_program ON public.user_profiles(program);
CREATE INDEX IF NOT EXISTS idx_user_profiles_employment_status ON public.user_profiles(employment_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_public ON public.user_profiles(is_public);

-- 2.3 PENDING_REGISTRATIONS TABLE - For approval workflow
CREATE TABLE IF NOT EXISTS public.pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    email TEXT NOT NULL,
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
    
    -- Contact Information
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Philippines',
    
    -- Supporting Documents/Images
    profile_image_url TEXT,
    id_document_url TEXT,
    diploma_url TEXT,
    
    -- Status and Processing
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'requires_documents')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id),
    rejection_reason TEXT,
    admin_notes TEXT,
    
    -- Additional verification fields
    verification_token TEXT,
    verified_email BOOLEAN DEFAULT FALSE,
    verified_documents BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for pending_registrations
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_submitted ON public.pending_registrations(submitted_at);

-- ============================================================================
-- SECTION 3: CONTENT MANAGEMENT TABLES
-- ============================================================================

-- 3.1 NEWS_ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.news_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content Information
    title TEXT NOT NULL,
    slug TEXT UNIQUE, -- URL-friendly version of title
    content TEXT NOT NULL,
    excerpt TEXT, -- Brief summary for listings
    
    -- Categorization
    category TEXT DEFAULT 'General' CHECK (category IN (
        'General', 'Academic', 'Events', 'Job Opportunities', 'Alumni Spotlight', 
        'University News', 'Achievements', 'Announcements', 'Reunions'
    )),
    tags TEXT[], -- Array of tags for better categorization
    
    -- Publication Settings
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    publish_at TIMESTAMP WITH TIME ZONE,
    expire_at TIMESTAMP WITH TIME ZONE,
    
    -- Media
    featured_image_url TEXT,
    image_alt_text TEXT,
    image_caption TEXT,
    gallery_urls TEXT[], -- Array of additional images
    
    -- SEO and Metadata
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    allow_comments BOOLEAN DEFAULT TRUE,
    
    -- Author Information
    author_name TEXT DEFAULT 'Alumni Office',
    author_id UUID REFERENCES public.users(id),
    editor_id UUID REFERENCES public.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for news_announcements
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news_announcements(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news_announcements(category);
CREATE INDEX IF NOT EXISTS idx_news_featured ON public.news_announcements(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news_announcements(slug);
CREATE INDEX IF NOT EXISTS idx_news_tags ON public.news_announcements USING gin(tags);

-- 3.2 GALLERY_ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Album Information
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    
    -- Event Details
    event_date DATE,
    event_location TEXT,
    event_type TEXT CHECK (event_type IN (
        'Graduation', 'Reunion', 'Conference', 'Workshop', 'Social', 
        'Academic', 'Sports', 'Cultural', 'Volunteer', 'Other'
    )),
    
    -- Media
    cover_image_url TEXT,
    cover_image_alt TEXT,
    
    -- Settings
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    allow_downloads BOOLEAN DEFAULT FALSE,
    requires_login BOOLEAN DEFAULT FALSE,
    
    -- Organization
    display_order INTEGER DEFAULT 0,
    image_count INTEGER DEFAULT 0, -- Denormalized count for performance
    
    -- Author Information
    created_by UUID REFERENCES public.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for gallery_albums
CREATE INDEX IF NOT EXISTS idx_gallery_albums_published ON public.gallery_albums(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_event_date ON public.gallery_albums(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_featured ON public.gallery_albums(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_slug ON public.gallery_albums(slug);

-- 3.3 GALLERY_IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    
    -- Image Information
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    caption TEXT,
    description TEXT,
    
    -- Technical Metadata
    file_name TEXT,
    file_size INTEGER, -- in bytes
    width INTEGER,
    height INTEGER,
    mime_type TEXT,
    
    -- Organization
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE, -- Featured image in album
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    
    -- Author Information
    uploaded_by UUID REFERENCES public.users(id),
    photographer TEXT, -- Name of photographer if different from uploader
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for gallery_images
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON public.gallery_images(album_id, display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_featured ON public.gallery_images(is_featured);

-- ============================================================================
-- SECTION 4: JOB OPPORTUNITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Job Information
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_logo_url TEXT,
    company_description TEXT,
    
    -- Job Details
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    qualifications TEXT,
    benefits TEXT,
    
    -- Job Classification
    job_type TEXT DEFAULT 'Full-time' CHECK (job_type IN (
        'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Freelance'
    )),
    experience_level TEXT CHECK (experience_level IN (
        'Entry Level', 'Mid Level', 'Senior Level', 'Executive', 'No Experience Required'
    )),
    industry TEXT,
    department TEXT,
    
    -- Location and Remote Work
    location TEXT,
    city TEXT,
    country TEXT DEFAULT 'Philippines',
    is_remote BOOLEAN DEFAULT FALSE,
    remote_type TEXT CHECK (remote_type IN ('Fully Remote', 'Hybrid', 'On-site')),
    
    -- Compensation
    salary_range TEXT,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency TEXT DEFAULT 'PHP',
    salary_period TEXT DEFAULT 'Monthly' CHECK (salary_period IN ('Hourly', 'Daily', 'Monthly', 'Annually')),
    
    -- Application Details
    how_to_apply TEXT,
    application_url TEXT,
    application_email TEXT,
    application_deadline DATE,
    contact_person TEXT,
    contact_phone TEXT,
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE, -- For premium/verified companies
    requires_portfolio BOOLEAN DEFAULT FALSE,
    
    -- Engagement Metrics
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    
    -- SEO
    keywords TEXT[],
    
    -- Posting Information
    posted_by UUID REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for job_opportunities
CREATE INDEX IF NOT EXISTS idx_job_opportunities_active ON public.job_opportunities(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_featured ON public.job_opportunities(is_featured);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_location ON public.job_opportunities(city, country);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_type ON public.job_opportunities(job_type);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_experience ON public.job_opportunities(experience_level);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_deadline ON public.job_opportunities(application_deadline);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_keywords ON public.job_opportunities USING gin(keywords);

-- ============================================================================
-- SECTION 5: TRACER STUDY SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tracer_study_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Personal Information (duplicated for data integrity)
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    age INTEGER,
    sex TEXT CHECK (sex IN ('Male', 'Female', 'Prefer not to say')),
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other')),
    civil_status TEXT CHECK (civil_status IN ('Single', 'Married', 'Divorced', 'Widowed', 'Separated')),
    
    -- Educational Background
    degree TEXT NOT NULL,
    program TEXT, -- Same as degree but more specific
    major TEXT,
    minor TEXT,
    graduation_year INTEGER NOT NULL,
    graduation_date DATE,
    gpa DECIMAL(3,2),
    latin_honor TEXT,
    thesis_title TEXT,
    
    -- Current Employment Status
    employment_status TEXT CHECK (employment_status IN (
        'Employed - Full Time',
        'Employed - Part Time', 
        'Self-Employed/Entrepreneur',
        'Unemployed - Looking for work',
        'Unemployed - Not looking for work',
        'Student - Graduate Studies',
        'Student - Additional Certification',
        'Retired',
        'Other'
    )),
    
    -- Current Job Details (if employed)
    current_company_name TEXT,
    current_job_title TEXT,
    current_job_description TEXT,
    current_industry TEXT,
    current_work_location TEXT,
    current_salary_range TEXT,
    current_employment_type TEXT CHECK (current_employment_type IN (
        'Regular/Permanent', 'Contractual', 'Part-time', 'Casual', 'Self-employed'
    )),
    
    -- Job Search and Career Path
    first_job_after_graduation TEXT,
    first_job_company TEXT,
    first_job_title TEXT,
    first_job_related_to_program BOOLEAN,
    time_to_find_first_job TEXT CHECK (time_to_find_first_job IN (
        'Less than 1 month', '1-3 months', '3-6 months', 
        '6-12 months', 'More than 1 year', 'Still seeking'
    )),
    job_search_methods TEXT[], -- Array of methods used
    job_search_duration TEXT,
    job_search_challenges TEXT,
    career_changes INTEGER DEFAULT 0,
    
    -- Skills and Competencies
    technical_skills TEXT[],
    soft_skills TEXT[],
    skills_learned_in_program TEXT[],
    skills_needed_improvement TEXT[],
    additional_trainings_taken TEXT[],
    certifications_earned TEXT[],
    
    -- Program Evaluation
    program_satisfaction INTEGER CHECK (program_satisfaction BETWEEN 1 AND 5),
    curriculum_relevance INTEGER CHECK (curriculum_relevance BETWEEN 1 AND 5),
    faculty_quality INTEGER CHECK (faculty_quality BETWEEN 1 AND 5),
    facilities_quality INTEGER CHECK (facilities_quality BETWEEN 1 AND 5),
    university_preparation INTEGER CHECK (university_preparation BETWEEN 1 AND 5),
    would_recommend_program BOOLEAN,
    
    -- Curriculum Feedback
    most_useful_subjects TEXT[],
    least_useful_subjects TEXT[],
    missing_subjects_suggestions TEXT[],
    teaching_methods_feedback TEXT,
    
    -- Further Education
    pursuing_further_education BOOLEAN DEFAULT FALSE,
    further_education_type TEXT CHECK (further_education_type IN (
        'Masters Degree', 'Doctorate', 'Professional Certification', 
        'Short Course', 'Online Course', 'Other'
    )),
    further_education_field TEXT,
    further_education_institution TEXT,
    further_education_reason TEXT,
    
    -- Alumni Engagement
    willing_to_mentor BOOLEAN DEFAULT FALSE,
    willing_to_speak_at_events BOOLEAN DEFAULT FALSE,
    interested_in_alumni_activities BOOLEAN DEFAULT FALSE,
    preferred_communication_channels TEXT[],
    alumni_network_value INTEGER CHECK (alumni_network_value BETWEEN 1 AND 5),
    
    -- Open-ended Feedback
    success_factors TEXT,
    challenges_faced TEXT,
    advice_to_current_students TEXT,
    suggestions_to_university TEXT,
    additional_comments TEXT,
    
    -- Response Metadata
    response_language TEXT DEFAULT 'English',
    time_spent_minutes INTEGER, -- Time spent filling out the form
    is_complete BOOLEAN DEFAULT FALSE,
    completion_percentage INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for tracer_study_responses
CREATE INDEX IF NOT EXISTS idx_tracer_study_user_id ON public.tracer_study_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_tracer_study_graduation_year ON public.tracer_study_responses(graduation_year);
CREATE INDEX IF NOT EXISTS idx_tracer_study_employment_status ON public.tracer_study_responses(employment_status);
CREATE INDEX IF NOT EXISTS idx_tracer_study_program ON public.tracer_study_responses(program);
CREATE INDEX IF NOT EXISTS idx_tracer_study_complete ON public.tracer_study_responses(is_complete, submitted_at);

-- ============================================================================
-- SECTION 6: MESSAGING AND COMMUNICATION
-- ============================================================================

-- 6.1 MESSAGES TABLE - For batchmate messaging
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Message Details
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'private' CHECK (message_type IN ('private', 'broadcast', 'announcement')),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    
    -- Threading
    parent_message_id UUID REFERENCES public.messages(id),
    thread_id UUID, -- For grouping related messages
    
    -- Attachments
    attachment_urls TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(recipient_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- SECTION 7: EVENTS AND NOTIFICATIONS
-- ============================================================================

-- 7.1 EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Information
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN (
        'Reunion', 'Seminar', 'Workshop', 'Job Fair', 'Networking', 
        'Social', 'Academic', 'Volunteer', 'Other'
    )),
    
    -- Date and Time
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT DEFAULT 'Asia/Manila',
    is_all_day BOOLEAN DEFAULT FALSE,
    
    -- Location
    location TEXT,
    venue TEXT,
    address TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    meeting_url TEXT,
    meeting_platform TEXT,
    
    -- Registration
    requires_registration BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    
    -- Visibility
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    target_audience TEXT[], -- Array of target groups
    
    -- Media
    banner_image_url TEXT,
    gallery_urls TEXT[],
    
    -- Organizer
    organized_by UUID REFERENCES public.users(id),
    contact_email TEXT,
    contact_phone TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for events
CREATE INDEX IF NOT EXISTS idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_published ON public.events(is_published, start_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(is_featured);

-- 7.2 EVENT_REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Registration Details
    registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN (
        'registered', 'confirmed', 'cancelled', 'attended', 'no_show'
    )),
    
    -- Additional Information
    special_requirements TEXT,
    dietary_restrictions TEXT,
    emergency_contact TEXT,
    
    -- Payment (if applicable)
    payment_status TEXT DEFAULT 'not_required' CHECK (payment_status IN (
        'not_required', 'pending', 'paid', 'refunded', 'waived'
    )),
    payment_amount DECIMAL(10,2) DEFAULT 0,
    payment_reference TEXT,
    
    -- Timestamps
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    attended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- Add indexes for event_registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id, registration_status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id, registration_status);

-- ============================================================================
-- SECTION 8: HELPER FUNCTIONS
-- ============================================================================

-- 8.1 is_admin function - Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = check_user_id 
        AND role IN ('admin', 'super_admin')
        AND approval_status = 'approved'
        AND is_active = TRUE
    );
END;
$$;

-- 8.2 get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.users 
    WHERE id = check_user_id;
    
    RETURN COALESCE(user_role, 'anonymous');
END;
$$;

-- 8.3 Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 8.4 Sync user approval function
CREATE OR REPLACE FUNCTION public.sync_user_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.approval_status = 'approved' THEN
        NEW.is_verified = TRUE;
        NEW.approved_at = COALESCE(NEW.approved_at, NOW());
    ELSIF NEW.approval_status = 'rejected' THEN
        NEW.is_verified = FALSE;
        NEW.approved_at = NULL;
    END IF;
    RETURN NEW;
END;
$$;

-- 8.5 Generate slug function
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN lower(regexp_replace(trim(title), '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$;

-- ============================================================================
-- SECTION 9: TRIGGERS
-- ============================================================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_pending_registrations_updated_at ON public.pending_registrations;
DROP TRIGGER IF EXISTS update_news_announcements_updated_at ON public.news_announcements;
DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON public.gallery_albums;
DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON public.gallery_images;
DROP TRIGGER IF EXISTS update_job_opportunities_updated_at ON public.job_opportunities;
DROP TRIGGER IF EXISTS update_tracer_study_responses_updated_at ON public.tracer_study_responses;
DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON public.event_registrations;
DROP TRIGGER IF EXISTS trigger_sync_user_approval ON public.users;

-- Create updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_registrations_updated_at
    BEFORE UPDATE ON public.pending_registrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_announcements_updated_at
    BEFORE UPDATE ON public.news_announcements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_albums_updated_at
    BEFORE UPDATE ON public.gallery_albums
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
    BEFORE UPDATE ON public.gallery_images
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_opportunities_updated_at
    BEFORE UPDATE ON public.job_opportunities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracer_study_responses_updated_at
    BEFORE UPDATE ON public.tracer_study_responses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User approval sync trigger
CREATE TRIGGER trigger_sync_user_approval
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_approval();

-- ============================================================================
-- SECTION 10: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracer_study_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow registration" ON public.users;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

DROP POLICY IF EXISTS "Admins can view pending registrations" ON public.pending_registrations;
DROP POLICY IF EXISTS "Admins can manage pending registrations" ON public.pending_registrations;
DROP POLICY IF EXISTS "Users can insert their registration" ON public.pending_registrations;

DROP POLICY IF EXISTS "Anyone can view published news" ON public.news_announcements;
DROP POLICY IF EXISTS "Authenticated users can view all news" ON public.news_announcements;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news_announcements;

DROP POLICY IF EXISTS "Anyone can view published albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Authenticated users can view all albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Admins can manage albums" ON public.gallery_albums;

DROP POLICY IF EXISTS "Anyone can view published gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated users can view all images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins can manage gallery images" ON public.gallery_images;

DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.job_opportunities;
DROP POLICY IF EXISTS "Authenticated users can view all jobs" ON public.job_opportunities;
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.job_opportunities;

DROP POLICY IF EXISTS "Users can view own tracer response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can insert own tracer response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can update own tracer response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Admins can view all tracer responses" ON public.tracer_study_responses;

-- USERS table policies
CREATE POLICY "Users can view their own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own record" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT WITH CHECK (role = 'alumni' AND approval_status = 'pending');

-- USER_PROFILES table policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can view public profiles" ON public.user_profiles
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- PENDING_REGISTRATIONS table policies
CREATE POLICY "Users can insert their registration" ON public.pending_registrations
    FOR INSERT WITH CHECK (TRUE); -- Anyone can submit registration

CREATE POLICY "Admins can view pending registrations" ON public.pending_registrations
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage pending registrations" ON public.pending_registrations
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- NEWS_ANNOUNCEMENTS table policies
CREATE POLICY "Anyone can view published news" ON public.news_announcements
    FOR SELECT USING (is_published = TRUE AND (publish_at IS NULL OR publish_at <= NOW()));

CREATE POLICY "Authenticated users can view all news" ON public.news_announcements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage news" ON public.news_announcements
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- GALLERY_ALBUMS table policies
CREATE POLICY "Anyone can view published albums" ON public.gallery_albums
    FOR SELECT USING (is_published = TRUE AND (requires_login = FALSE OR auth.role() = 'authenticated'));

CREATE POLICY "Authenticated users can view all albums" ON public.gallery_albums
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage albums" ON public.gallery_albums
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- GALLERY_IMAGES table policies
CREATE POLICY "Anyone can view published gallery images" ON public.gallery_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.gallery_albums
            WHERE id = gallery_images.album_id 
            AND is_published = TRUE 
            AND (requires_login = FALSE OR auth.role() = 'authenticated')
        )
    );

CREATE POLICY "Authenticated users can view all images" ON public.gallery_images
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM public.gallery_albums WHERE id = gallery_images.album_id)
    );

CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- JOB_OPPORTUNITIES table policies
CREATE POLICY "Anyone can view active jobs" ON public.job_opportunities
    FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Authenticated users can view all jobs" ON public.job_opportunities
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage jobs" ON public.job_opportunities
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- TRACER_STUDY_RESPONSES table policies
CREATE POLICY "Users can view own tracer response" ON public.tracer_study_responses
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert own tracer response" ON public.tracer_study_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracer response" ON public.tracer_study_responses
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tracer responses" ON public.tracer_study_responses
    FOR SELECT USING (public.is_admin(auth.uid()));

-- MESSAGES table policies
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their messages" ON public.messages
    FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Admins can manage all messages" ON public.messages
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- EVENTS table policies
CREATE POLICY "Anyone can view published events" ON public.events
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Authenticated users can view all events" ON public.events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- EVENT_REGISTRATIONS table policies
CREATE POLICY "Users can view own registrations" ON public.event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations" ON public.event_registrations
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON public.event_registrations
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all registrations" ON public.event_registrations
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- SECTION 11: GRANT PERMISSIONS
-- ============================================================================

-- Grant table permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Users table
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon; -- For login/registration

-- User profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;

-- Pending registrations
GRANT INSERT ON public.pending_registrations TO authenticated, anon;
GRANT SELECT, UPDATE, DELETE ON public.pending_registrations TO authenticated;

-- News
GRANT SELECT ON public.news_announcements TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.news_announcements TO authenticated;

-- Gallery
GRANT SELECT ON public.gallery_albums TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
GRANT SELECT ON public.gallery_images TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;

-- Jobs
GRANT SELECT ON public.job_opportunities TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.job_opportunities TO authenticated;

-- Tracer study
GRANT SELECT, INSERT, UPDATE ON public.tracer_study_responses TO authenticated;

-- Messages
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

-- Events
GRANT SELECT ON public.events TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;

-- Functions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_approval TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_slug TO authenticated;

-- ============================================================================
-- SECTION 12: SEED DATA
-- ============================================================================

-- Insert default super admin user
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    approval_status,
    is_verified,
    is_active,
    approved_at,
    registration_date,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'paung_230000001724@uic.edu.ph',
    'Admin',
    'User',
    'super_admin',
    'approved',
    TRUE,
    TRUE,
    NOW(),
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    approval_status = 'approved',
    is_verified = TRUE,
    is_active = TRUE,
    approved_at = NOW(),
    updated_at = NOW();

-- Insert sample news categories and initial content
INSERT INTO public.news_announcements (
    title,
    slug,
    content,
    excerpt,
    category,
    is_published,
    is_featured,
    author_name,
    created_at,
    updated_at,
    published_at
) VALUES (
    'Welcome to the CCS Alumni Portal',
    'welcome-to-ccs-alumni-portal',
    'We are excited to launch the new CCS Alumni Portal! This platform will serve as the central hub for all alumni activities, networking, and professional development opportunities.',
    'Welcome to the new CCS Alumni Portal - your gateway to staying connected with fellow alumni.',
    'Announcements',
    TRUE,
    TRUE,
    'Alumni Office',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample job categories
INSERT INTO public.job_opportunities (
    title,
    company,
    description,
    requirements,
    job_type,
    location,
    salary_range,
    is_active,
    is_featured,
    created_at,
    updated_at
) VALUES (
    'Software Developer - Fresh Graduate Welcome',
    'TechCorp Philippines',
    'We are looking for passionate fresh graduates to join our development team. You will work on exciting projects using modern technologies.',
    'Bachelor''s degree in Computer Science, Information Technology, or related field. Knowledge of programming languages such as Java, Python, or JavaScript.',
    'Full-time',
    'Davao City, Philippines',
    '₱25,000 - ₱35,000',
    TRUE,
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Commit the transaction
COMMIT;

-- ============================================================================
-- POST-INSTALLATION VERIFICATION
-- ============================================================================

-- Verify all tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    tables_to_check TEXT[] := ARRAY[
        'users', 'user_profiles', 'pending_registrations', 
        'news_announcements', 'gallery_albums', 'gallery_images',
        'job_opportunities', 'tracer_study_responses', 'messages',
        'events', 'event_registrations'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ SUCCESS: All required tables created successfully!';
    END IF;
END $$;

-- Display completion message
SELECT 
    '🎉 CCS ALUMNI PORTAL DATABASE SCHEMA COMPLETED!' as status,
    'Database schema has been successfully created and configured.' as message,
    'Project URL: https://cnjdmddqwfryvqnhirkb.supabase.co' as project_url,
    NOW() as completed_at;

-- ============================================================================
-- 📋 IMPORTANT NEXT STEPS:
-- ============================================================================

-- 1. CREATE STORAGE BUCKETS in Supabase Dashboard:
--    - Go to Storage section
--    - Create these buckets with public access:
--      • 'avatars' (5MB limit) - Profile pictures
--      • 'gallery' (10MB limit) - Gallery images  
--      • 'documents' (5MB limit) - Document uploads
--      • 'news-images' (5MB limit) - News article images
--
-- 2. CONFIGURE AUTHENTICATION:
--    - Go to Authentication > Settings
--    - Set Site URL: http://localhost:3000 (development)
--    - Add Redirect URLs: http://localhost:3000/**
--    - Configure email templates
--
-- 3. TEST THE SYSTEM:
--    - Run: npm start
--    - Test user registration
--    - Test admin login with paung_230000001724@uic.edu.ph
--    - Verify all features work properly
--
-- 4. VERIFY DATA ACCESS:
--    - Test database queries in SQL Editor
--    - Verify RLS policies are working
--    - Check that all indexes are created
--
-- 5. DEPLOYMENT CONSIDERATIONS:
--    - Update environment variables for production
--    - Configure backup schedules
--    - Set up monitoring and alerts
--    - Review security settings
--
-- Your CCS Alumni Portal database is now fully configured and ready to use!

-- ============================================================================
-- 🎉 SETUP COMPLETE!
-- ============================================================================
