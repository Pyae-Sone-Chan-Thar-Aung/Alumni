-- Fix job opportunities visibility for anonymous (non-registered) users
-- This allows both authenticated and anonymous users to view active job opportunities

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active job opportunities" ON public.job_opportunities;
DROP POLICY IF EXISTS "Authenticated users can view job opportunities" ON public.job_opportunities;

-- Create a new policy that allows BOTH authenticated and anonymous users to view active jobs
CREATE POLICY "Public can view active job opportunities" 
ON public.job_opportunities
FOR SELECT
TO public  -- This grants access to both authenticated and anon roles
USING (is_active = true);

-- Verify RLS is enabled
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;

-- Verify the fix
SELECT 
  'Job opportunities are now visible to all visitors!' as status,
  'Anonymous users can now see job count on home page' as note;
