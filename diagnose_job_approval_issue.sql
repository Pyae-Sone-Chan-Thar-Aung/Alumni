-- ===================================================================
-- DIAGNOSE JOB APPROVAL ISSUE
-- ===================================================================
-- This script checks all components needed for job approval
-- ===================================================================

-- 1. Check if is_admin function exists
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'is_admin' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Check current user's role (run this while logged in as admin)
SELECT 
    id,
    email,
    role,
    approval_status
FROM public.users
WHERE email = 'your-admin-email@example.com'; -- Replace with actual admin email

-- 3. Check all columns in job_opportunities table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_opportunities'
ORDER BY ordinal_position;

-- 4. Check all RLS policies on job_opportunities
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    LEFT(qual::text, 100) as using_expression,
    LEFT(with_check::text, 100) as with_check_expression
FROM pg_policies 
WHERE tablename = 'job_opportunities'
ORDER BY policyname;

-- 5. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'job_opportunities';

-- 6. List pending jobs
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
ORDER BY created_at DESC
LIMIT 5;

-- 7. Test if we can update a specific job (REPLACE job_id with actual ID)
-- Uncomment and replace the ID to test:
-- UPDATE public.job_opportunities 
-- SET approval_status = 'approved',
--     is_active = true,
--     reviewed_at = NOW(),
--     approved_by = auth.uid()
-- WHERE id = 'REPLACE-WITH-ACTUAL-JOB-ID'::uuid;
