-- Fix RLS policy for job_opportunities table
-- This allows all authenticated users (especially alumni) to view job opportunities

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Anyone can view job opportunities" ON public.job_opportunities;
DROP POLICY IF EXISTS "Alumni can view jobs" ON public.job_opportunities;
DROP POLICY IF EXISTS "Users can view job opportunities" ON public.job_opportunities;

-- Create a permissive SELECT policy for all authenticated users
CREATE POLICY "Authenticated users can view job opportunities" 
ON public.job_opportunities
FOR SELECT
TO authenticated
USING (true);

-- Keep admin policies for INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Admins can manage job opportunities" ON public.job_opportunities;

CREATE POLICY "Admins can insert job opportunities" 
ON public.job_opportunities
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update job opportunities" 
ON public.job_opportunities
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete job opportunities" 
ON public.job_opportunities
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Verify RLS is enabled
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;

SELECT 'Job opportunities RLS policies fixed! Alumni users can now view jobs.' as status;
