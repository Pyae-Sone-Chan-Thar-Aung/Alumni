-- ===================================================================
-- TEST ADMIN JOB UPDATE
-- ===================================================================
-- Run this while logged in as the admin user in Supabase SQL Editor
-- This will help diagnose the exact issue
-- ===================================================================

-- 1. Check who you are logged in as
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- 2. Check if current user is admin
SELECT 
    id,
    email,
    role,
    approval_status as user_approval_status
FROM public.users
WHERE id = auth.uid();

-- 3. Get a pending job ID to test with
SELECT 
    id,
    title,
    company,
    approval_status,
    is_alumni_submission,
    posted_by
FROM public.job_opportunities
WHERE approval_status = 'pending'
LIMIT 1;

-- 4. Try to update that job (COPY THE ID FROM STEP 3 AND PASTE BELOW)
-- Replace 'PASTE-JOB-ID-HERE' with actual UUID from step 3
/*
UPDATE public.job_opportunities 
SET 
    approval_status = 'approved',
    reviewed_at = NOW(),
    is_active = true,
    approved_by = auth.uid()
WHERE id = 'PASTE-JOB-ID-HERE'::uuid
RETURNING *;
*/

-- 5. Check what policies are blocking (if update fails)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'job_opportunities'
ORDER BY cmd, policyname;

-- 6. Test if admin check works
SELECT 
    auth.uid() as current_user,
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ) as is_admin_check;
