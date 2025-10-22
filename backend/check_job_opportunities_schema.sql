-- Check the job_opportunities table structure
-- Run this in your Supabase SQL Editor

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'job_opportunities' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we have enum constraint on job_type
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%job_opportunities%job_type%';

-- Check current data in the table
SELECT COUNT(*) as total_jobs FROM public.job_opportunities;

-- Check unique job types currently in use
SELECT DISTINCT job_type, COUNT(*) as count
FROM public.job_opportunities 
GROUP BY job_type 
ORDER BY job_type;