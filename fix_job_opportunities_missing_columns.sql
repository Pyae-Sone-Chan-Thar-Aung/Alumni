-- ===================================================================
-- FIX JOB OPPORTUNITIES TABLE - ADD MISSING COLUMNS
-- ===================================================================
-- This script adds the missing columns required by the JobSubmission component
-- ===================================================================

-- Add contact_phone if it doesn't exist (for job contact information)
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add submission_type column to track how job was submitted (form, pdf, image)
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS submission_type TEXT CHECK (submission_type IN ('form', 'pdf', 'image'));

-- Add submission_file_url for PDF uploads
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS submission_file_url TEXT;

-- Add submission_image_url for image uploads
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS submission_image_url TEXT;

-- Add approval_status for tracking alumni submissions
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add is_alumni_submission flag
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS is_alumni_submission BOOLEAN DEFAULT FALSE;

-- Add contact_person if it doesn't exist (already in schema but just in case)
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS contact_person TEXT;

-- Add application_email if it doesn't exist (already in schema but just in case)
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS application_email TEXT;

-- ===================================================================
-- VERIFICATION QUERY
-- ===================================================================

-- Check that all required columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_opportunities'
AND column_name IN (
    'contact_phone',
    'submission_type',
    'submission_file_url',
    'submission_image_url',
    'approval_status',
    'is_alumni_submission',
    'contact_person',
    'application_email'
)
ORDER BY column_name;

-- Show sample of the table structure
SELECT 
    id,
    title,
    company,
    job_type,
    is_active,
    approval_status,
    is_alumni_submission,
    submission_type,
    contact_phone,
    created_at
FROM public.job_opportunities
LIMIT 5;
