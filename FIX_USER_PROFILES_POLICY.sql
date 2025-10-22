-- ===================================================================
-- FIX USER_PROFILES RLS POLICY
-- ===================================================================
-- Allow users to create their own profile during registration
-- ===================================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Also ensure users can UPDATE their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ensure users can SELECT their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'user_profiles'
    AND schemaname = 'public'
ORDER BY cmd, policyname;

-- ===================================================================
-- COMPLETED!
-- ===================================================================
