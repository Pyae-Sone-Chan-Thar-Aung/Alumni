-- ===================================================================
-- FIX JOB_TYPE CHECK CONSTRAINT
-- ===================================================================
-- The frontend sends: 'Full-time', 'Part-time', 'Contract', 'Internship'
-- But the database might have different values in the CHECK constraint
-- This script fixes the constraint to accept the correct values
-- ===================================================================

-- First, drop the existing check constraint
ALTER TABLE public.job_opportunities 
DROP CONSTRAINT IF EXISTS job_opportunities_job_type_check;

-- Recreate the constraint with the correct values that match the frontend
ALTER TABLE public.job_opportunities
ADD CONSTRAINT job_opportunities_job_type_check 
CHECK (job_type IN (
    'Full-time',      -- Matches frontend
    'Part-time',      -- Matches frontend  
    'Contract',       -- Matches frontend
    'Internship',     -- Matches frontend
    'Temporary',      -- Additional option
    'Freelance'       -- Additional option
));

-- ===================================================================
-- UPDATE EXISTING DATA (if any conflicts exist)
-- ===================================================================

-- Update any existing rows that might have old values
-- This maps common variations to the standardized values
UPDATE public.job_opportunities 
SET job_type = CASE 
    WHEN job_type ILIKE '%full%time%' OR job_type = 'Full Time' THEN 'Full-time'
    WHEN job_type ILIKE '%part%time%' OR job_type = 'Part Time' THEN 'Part-time'
    WHEN job_type ILIKE '%contract%' THEN 'Contract'
    WHEN job_type ILIKE '%intern%' THEN 'Internship'
    WHEN job_type ILIKE '%temp%' THEN 'Temporary'
    WHEN job_type ILIKE '%freelance%' THEN 'Freelance'
    ELSE job_type
END
WHERE job_type NOT IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Freelance');

-- ===================================================================
-- VERIFICATION
-- ===================================================================

-- Check the constraint was created correctly
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'job_opportunities_job_type_check';

-- Check current job types in the table
SELECT 
    job_type, 
    COUNT(*) as count
FROM public.job_opportunities 
GROUP BY job_type
ORDER BY job_type;

-- Test insert (will rollback automatically if in a transaction)
-- Uncomment to test:
-- INSERT INTO public.job_opportunities (title, company, description, job_type)
-- VALUES ('Test Job', 'Test Company', 'Test Description', 'Full-time');
