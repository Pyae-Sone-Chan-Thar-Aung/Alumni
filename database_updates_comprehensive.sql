-- ============================================================================
-- COMPREHENSIVE DATABASE UPDATES FOR CCS ALUMNI PORTAL
-- ============================================================================
-- This script implements all requested features:
-- 1. Coordinator role for jobs and messaging
-- 2. Job submission with PDF/image upload and approval workflow
-- 3. Dynamic tracer study questionnaire system
-- 4. Notification system
-- 5. Location tracking for map visualization
-- 6. Updated registration fields (removed student ID, batch year)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. UPDATE ROLE SYSTEM TO INCLUDE COORDINATOR
-- ============================================================================

-- Update users table to include coordinator role
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'coordinator', 'alumni', 'super_admin'));

-- Update is_admin function to include coordinator for job-related permissions
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
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

-- Function to check if user can manage jobs (admin or coordinator)
CREATE OR REPLACE FUNCTION public.can_manage_jobs(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id
        AND role IN ('admin', 'coordinator', 'super_admin')
        AND approval_status = 'approved'
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check coordinator role
CREATE OR REPLACE FUNCTION public.is_coordinator(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_id
        AND role = 'coordinator'
        AND approval_status = 'approved'
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. UPDATE JOB_OPPORTUNITIES TABLE FOR SUBMISSION AND APPROVAL
-- ============================================================================

-- Add new columns for job submission workflow
ALTER TABLE public.job_opportunities
  ADD COLUMN IF NOT EXISTS submission_type TEXT CHECK (submission_type IN ('form', 'pdf', 'image')) DEFAULT 'form',
  ADD COLUMN IF NOT EXISTS submission_file_url TEXT,
  ADD COLUMN IF NOT EXISTS submission_image_url TEXT,
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approval_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_alumni_submission BOOLEAN DEFAULT FALSE;

-- Create index for approval status
CREATE INDEX IF NOT EXISTS idx_job_opportunities_approval_status 
  ON public.job_opportunities(approval_status);

-- ============================================================================
-- 3. CREATE DYNAMIC TRACER STUDY SYSTEM
-- ============================================================================

-- Survey templates table
CREATE TABLE IF NOT EXISTS public.tracer_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey questions table
CREATE TABLE IF NOT EXISTS public.tracer_survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.tracer_surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date', 'boolean')),
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    section TEXT,
    options JSONB, -- For select, radio, checkbox types
    validation_rules JSONB, -- For custom validation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(survey_id, display_order)
);

-- Survey responses (replaces hard-coded tracer_study_responses structure)
CREATE TABLE IF NOT EXISTS public.tracer_survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.tracer_surveys(id),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    responses JSONB NOT NULL, -- Flexible JSON structure for all answers
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(survey_id, user_id)
);

-- Keep existing tracer_study_responses for backward compatibility
-- But mark as deprecated in favor of dynamic system

-- ============================================================================
-- 4. CREATE NOTIFICATION SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('registration_approved', 'registration_rejected', 'job_approved', 'job_rejected', 'news', 'announcement', 'message')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- ============================================================================
-- 5. UPDATE USER PROFILES FOR LOCATION TRACKING (MAP)
-- ============================================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_location 
  ON public.user_profiles(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ============================================================================
-- 6. UPDATE PENDING_REGISTRATIONS (REMOVE STUDENT_ID, BATCH_YEAR REQUIREMENTS)
-- ============================================================================

-- Make student_id and batch_year nullable (already should be, but ensure)
ALTER TABLE public.pending_registrations
  ALTER COLUMN student_id DROP NOT NULL,
  ALTER COLUMN batch_year DROP NOT NULL;

-- Add employment status field for unemployed alumni
ALTER TABLE public.pending_registrations
  ADD COLUMN IF NOT EXISTS employment_status TEXT CHECK (employment_status IN (
    'Employed - Full Time', 'Employed - Part Time', 'Self-Employed',
    'Unemployed - Looking', 'Unemployed - Not Looking', 'Student', 'Retired'
  ));

-- ============================================================================
-- 7. CREATE INTERNAL NEWS TABLE (ALUMNI-ONLY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.internal_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    author_id UUID REFERENCES public.users(id),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    is_important BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_news_published 
  ON public.internal_news(is_published, published_at DESC);

-- ============================================================================
-- 8. CREATE STORAGE BUCKETS FOR JOB SUBMISSIONS
-- ============================================================================

-- Note: Storage buckets should be created via Supabase Dashboard
-- This is a reference comment for bucket creation:
-- Bucket name: 'job-submissions'
-- Public: false (private)
-- Allowed MIME types: application/pdf, image/jpeg, image/png, image/jpg

-- ============================================================================
-- 9. UPDATE RLS POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.tracer_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracer_survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracer_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_news ENABLE ROW LEVEL SECURITY;

-- Tracer Surveys Policies
DROP POLICY IF EXISTS "Admins can manage surveys" ON public.tracer_surveys;
CREATE POLICY "Admins can manage surveys" ON public.tracer_surveys
  FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view active surveys" ON public.tracer_surveys;
CREATE POLICY "Anyone can view active surveys" ON public.tracer_surveys
  FOR SELECT USING (is_active = TRUE);

-- Tracer Survey Questions Policies
DROP POLICY IF EXISTS "Admins can manage questions" ON public.tracer_survey_questions;
CREATE POLICY "Admins can manage questions" ON public.tracer_survey_questions
  FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view questions of active surveys" ON public.tracer_survey_questions;
CREATE POLICY "Anyone can view questions of active surveys" ON public.tracer_survey_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tracer_surveys 
      WHERE id = tracer_survey_questions.survey_id 
      AND is_active = TRUE
    )
  );

-- Tracer Survey Responses Policies
DROP POLICY IF EXISTS "Users can view their own responses" ON public.tracer_survey_responses;
CREATE POLICY "Users can view their own responses" ON public.tracer_survey_responses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own responses" ON public.tracer_survey_responses;
CREATE POLICY "Users can insert their own responses" ON public.tracer_survey_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own responses" ON public.tracer_survey_responses;
CREATE POLICY "Users can update their own responses" ON public.tracer_survey_responses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all responses" ON public.tracer_survey_responses;
CREATE POLICY "Admins can view all responses" ON public.tracer_survey_responses
  FOR SELECT USING (is_admin(auth.uid()));

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Trigger/function will handle proper user_id

-- Internal News Policies
DROP POLICY IF EXISTS "Alumni can view published internal news" ON public.internal_news;
CREATE POLICY "Alumni can view published internal news" ON public.internal_news
  FOR SELECT USING (
    is_published = TRUE 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'alumni' 
      AND approval_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins and coordinators can manage internal news" ON public.internal_news;
CREATE POLICY "Admins and coordinators can manage internal news" ON public.internal_news
  FOR ALL USING (is_admin(auth.uid()) OR is_coordinator(auth.uid()));

-- Job Opportunities Policies Update
DROP POLICY IF EXISTS "Coordinator can manage jobs" ON public.job_opportunities;
CREATE POLICY "Coordinator can manage jobs" ON public.job_opportunities
  FOR ALL USING (can_manage_jobs(auth.uid()));

-- Allow alumni to submit jobs (insert only with approval_status = 'pending')
DROP POLICY IF EXISTS "Alumni can submit jobs" ON public.job_opportunities;
CREATE POLICY "Alumni can submit jobs" ON public.job_opportunities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'alumni' 
      AND approval_status = 'approved'
    )
    AND approval_status = 'pending'
    AND is_alumni_submission = TRUE
  );

-- Alumni can view only approved jobs
DROP POLICY IF EXISTS "Alumni can view approved jobs" ON public.job_opportunities;
CREATE POLICY "Alumni can view approved jobs" ON public.job_opportunities
  FOR SELECT USING (
    (approval_status = 'approved' AND is_active = TRUE)
    OR posted_by = auth.uid()
  );

-- ============================================================================
-- 10. CREATE TRIGGERS FOR AUTO-UPDATES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_on_registration_decision()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approval_status != OLD.approval_status THEN
        IF NEW.approval_status = 'approved' THEN
            INSERT INTO public.notifications (user_id, type, title, message, link_url)
            VALUES (
                NEW.id,
                'registration_approved',
                'Registration Approved',
                'Your registration has been approved. You can now access the alumni portal.',
                '/alumni-dashboard'
            );
        ELSIF NEW.approval_status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, type, title, message)
            VALUES (
                NEW.id,
                'registration_rejected',
                'Registration Rejected',
                'Your registration has been reviewed and rejected. Please contact the administrator for more information.'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_registration_decision ON public.users;
CREATE TRIGGER trigger_notify_registration_decision
    AFTER UPDATE OF approval_status ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_registration_decision();

-- Trigger for job approval notifications
CREATE OR REPLACE FUNCTION public.notify_on_job_decision()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approval_status != OLD.approval_status AND NEW.is_alumni_submission = TRUE THEN
        IF NEW.approval_status = 'approved' THEN
            INSERT INTO public.notifications (user_id, type, title, message, link_url)
            VALUES (
                NEW.posted_by,
                'job_approved',
                'Job Post Approved',
                'Your job submission "' || NEW.title || '" has been approved and is now visible to alumni.',
                '/job-opportunities'
            );
        ELSIF NEW.approval_status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, type, title, message)
            VALUES (
                NEW.posted_by,
                'job_rejected',
                'Job Post Rejected',
                'Your job submission "' || NEW.title || '" has been reviewed and rejected. ' ||
                COALESCE(NEW.approval_notes, 'Please review the guidelines and submit again.')
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_job_decision ON public.job_opportunities;
CREATE TRIGGER trigger_notify_job_decision
    AFTER UPDATE OF approval_status ON public.job_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_on_job_decision();

-- ============================================================================
-- 11. CREATE VIEWS FOR CONVENIENCE
-- ============================================================================

-- View for alumni locations on map
CREATE OR REPLACE VIEW public.alumni_locations AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    up.current_job_title,
    up.current_company,
    up.latitude,
    up.longitude,
    up.city,
    up.province,
    up.country,
    up.address,
    u.role,
    u.approval_status
FROM public.users u
JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.role = 'alumni'
  AND u.approval_status = 'approved'
  AND up.latitude IS NOT NULL
  AND up.longitude IS NOT NULL;

COMMENT ON VIEW public.alumni_locations IS 'Alumni locations for map visualization in admin dashboard';

COMMIT;

-- ============================================================================
-- POST-EXECUTION NOTES
-- ============================================================================
-- 1. Create storage bucket 'job-submissions' in Supabase Dashboard
-- 2. Update any existing jobs to have approval_status = 'approved' if they are active
-- 3. Create a default tracer survey template for migration
-- 4. Set up email service for notification emails (Supabase Edge Functions recommended)
-- ============================================================================

