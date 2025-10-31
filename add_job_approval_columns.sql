-- ===================================================================
-- ADD JOB APPROVAL TRACKING COLUMNS
-- ===================================================================
-- This script adds the missing columns needed by the admin approval system
-- ===================================================================

-- Add reviewed_at timestamp to track when job was reviewed
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add approval_notes to store admin notes/reasons for approval/rejection
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Ensure approved_by column exists (should already exist from schema)
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);

-- ===================================================================
-- UPDATE RLS POLICIES FOR JOB OPPORTUNITIES
-- ===================================================================
-- Ensure admins can update job approval status

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.job_opportunities;
DROP POLICY IF EXISTS "Admins full access to jobs" ON public.job_opportunities;

-- Create comprehensive admin policy for job management
CREATE POLICY "Admins can manage all jobs"
ON public.job_opportunities
FOR ALL
TO authenticated
USING (
    public.is_admin(auth.uid())
)
WITH CHECK (
    public.is_admin(auth.uid())
);

-- Allow public to read approved and active jobs
DROP POLICY IF EXISTS "Public can view active jobs" ON public.job_opportunities;
CREATE POLICY "Public can view active jobs"
ON public.job_opportunities
FOR SELECT
TO public
USING (
    is_active = true 
    AND approval_status = 'approved'
);

-- Allow authenticated users to view all approved jobs (even inactive ones)
DROP POLICY IF EXISTS "Authenticated users view approved jobs" ON public.job_opportunities;
CREATE POLICY "Authenticated users view approved jobs"
ON public.job_opportunities
FOR SELECT
TO authenticated
USING (
    approval_status = 'approved'
    OR public.is_admin(auth.uid())
);

-- Allow alumni to insert job submissions
DROP POLICY IF EXISTS "Alumni can submit jobs" ON public.job_opportunities;
CREATE POLICY "Alumni can submit jobs"
ON public.job_opportunities
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = posted_by
    AND is_alumni_submission = true
    AND approval_status = 'pending'
);

-- Allow alumni to update their own pending submissions
DROP POLICY IF EXISTS "Alumni can update their pending jobs" ON public.job_opportunities;
CREATE POLICY "Alumni can update their pending jobs"
ON public.job_opportunities
FOR UPDATE
TO authenticated
USING (
    auth.uid() = posted_by
    AND approval_status = 'pending'
    AND is_alumni_submission = true
)
WITH CHECK (
    auth.uid() = posted_by
    AND approval_status = 'pending'
    AND is_alumni_submission = true
);

-- ===================================================================
-- VERIFICATION
-- ===================================================================

-- Check all columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_opportunities'
AND column_name IN (
    'reviewed_at',
    'approval_notes',
    'approved_by',
    'approval_status',
    'is_alumni_submission',
    'posted_by'
)
ORDER BY column_name;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'job_opportunities'
ORDER BY policyname;

-- Show pending jobs that need review
SELECT 
    id,
    title,
    company,
    approval_status,
    is_alumni_submission,
    is_active,
    posted_by,
    created_at
FROM public.job_opportunities
WHERE approval_status = 'pending'
ORDER BY created_at DESC;
