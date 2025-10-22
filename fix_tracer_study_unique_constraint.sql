-- Fix Tracer Study Unique Constraint
-- Run this in your Supabase SQL Editor

-- Check if the constraint already exists
SELECT 'Current constraints on tracer_study_responses:' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (
    SELECT oid FROM pg_class WHERE relname = 'tracer_study_responses'
)
ORDER BY contype, conname;

-- Check for duplicate user_id entries (these would prevent adding unique constraint)
SELECT 'Checking for duplicate user_id entries:' as info;
SELECT user_id, COUNT(*) as count
FROM public.tracer_study_responses 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- If there are duplicates, you'll need to clean them up first
-- This query will keep only the most recent entry for each user
-- UNCOMMENT AND RUN ONLY IF YOU HAVE DUPLICATES:
-- DELETE FROM public.tracer_study_responses 
-- WHERE id NOT IN (
--     SELECT DISTINCT ON (user_id) id 
--     FROM public.tracer_study_responses 
--     ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC
-- );

-- Add the unique constraint on user_id
ALTER TABLE public.tracer_study_responses 
ADD CONSTRAINT unique_tracer_study_user_id 
UNIQUE (user_id);

-- Verify the constraint was added
SELECT 'Updated constraints on tracer_study_responses:' as info;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (
    SELECT oid FROM pg_class WHERE relname = 'tracer_study_responses'
)
ORDER BY contype, conname;

SELECT 'Unique constraint on user_id added successfully! Tracer study upsert will now work.' as status;