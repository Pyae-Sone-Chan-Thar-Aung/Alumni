-- Debug job_opportunities table constraints and test insertion
-- Run this in your Supabase SQL Editor

-- 1. Check all constraints on job_opportunities table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (
    SELECT oid FROM pg_class WHERE relname = 'job_opportunities'
)
ORDER BY contype, conname;

-- 2. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'job_opportunities' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if there are any triggers on the table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'job_opportunities';

-- 4. Test insertion with minimal required data (replace 'YOUR_USER_ID' with actual user ID)
-- First, let's see what user IDs exist
SELECT id, email, role FROM auth.users LIMIT 5;

-- You can manually test an insert like this (replace the UUID with a real user ID):
-- INSERT INTO public.job_opportunities (
--     title, 
--     description, 
--     company, 
--     location, 
--     job_type, 
--     posted_by,
--     is_active
-- ) VALUES (
--     'Test Job', 
--     'Test Description', 
--     'Test Company', 
--     'Test Location', 
--     'Full-time', 
--     'your-user-id-here',
--     true
-- );

SELECT 'Ready to test job opportunities constraints!' as status;