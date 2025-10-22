-- Fix Employment Status Check Constraint
-- Run this in your Supabase SQL Editor

-- Check the current constraint
SELECT 'Current employment_status constraint:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'tracer_study_responses_employment_status_check';

-- Check what values are currently in the table (if any)
SELECT 'Current employment_status values in table:' as info;
SELECT DISTINCT employment_status, COUNT(*) as count
FROM public.tracer_study_responses 
WHERE employment_status IS NOT NULL
GROUP BY employment_status 
ORDER BY employment_status;

-- Drop the existing constraint
ALTER TABLE public.tracer_study_responses 
DROP CONSTRAINT IF EXISTS tracer_study_responses_employment_status_check;

-- Add the new constraint with all the form options
ALTER TABLE public.tracer_study_responses 
ADD CONSTRAINT tracer_study_responses_employment_status_check 
CHECK (employment_status IN (
    'Employed (Full-time)',
    'Employed (Part-time)',
    'Self-employed/Freelancer',
    'Unemployed',
    'Student (Graduate Studies)',
    'Not in Labor Force'
));

-- Verify the constraint was updated
SELECT 'Updated employment_status constraint:' as info;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'tracer_study_responses_employment_status_check';

SELECT 'Employment status constraint updated successfully! Form should now work.' as status;