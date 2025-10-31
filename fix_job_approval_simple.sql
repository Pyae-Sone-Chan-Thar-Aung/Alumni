-- ===================================================================
-- SIMPLIFIED JOB APPROVAL FIX
-- ===================================================================
-- This creates simple, working RLS policies for job approval
-- ===================================================================

-- Step 1: Ensure all required columns exist
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);

-- Step 2: Drop ALL existing policies on job_opportunities
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'job_opportunities' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.job_opportunities';
    END LOOP;
END $$;

-- Step 3: Create simple, working policies

-- Policy 1: Admins can do everything
CREATE POLICY "admin_all_access"
ON public.job_opportunities
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policy 2: Public can view approved and active jobs
CREATE POLICY "public_view_active_jobs"
ON public.job_opportunities
FOR SELECT
TO public
USING (
    is_active = true 
    AND (approval_status = 'approved' OR approval_status IS NULL)
);

-- Policy 3: Authenticated users can view all approved jobs
CREATE POLICY "authenticated_view_approved"
ON public.job_opportunities
FOR SELECT
TO authenticated
USING (
    approval_status = 'approved' 
    OR approval_status IS NULL
    OR EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policy 4: Alumni can insert their own job submissions
CREATE POLICY "alumni_insert_jobs"
ON public.job_opportunities
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = posted_by
);

-- Policy 5: Alumni can update their own pending jobs
CREATE POLICY "alumni_update_own_pending"
ON public.job_opportunities
FOR UPDATE
TO authenticated
USING (
    auth.uid() = posted_by
    AND approval_status = 'pending'
)
WITH CHECK (
    auth.uid() = posted_by
);

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant necessary permissions
GRANT ALL ON public.job_opportunities TO authenticated;
GRANT SELECT ON public.job_opportunities TO anon;

-- ===================================================================
-- VERIFICATION
-- ===================================================================

-- Show all policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'job_opportunities'
ORDER BY policyname;

-- Show pending jobs
SELECT 
    id,
    title,
    company,
    approval_status,
    is_alumni_submission,
    posted_by,
    created_at
FROM public.job_opportunities
WHERE approval_status = 'pending'
ORDER BY created_at DESC;

-- Check admin users
SELECT 
    id,
    email,
    role
FROM public.users
WHERE role = 'admin';
