-- ===================================================================
-- FIX REGISTRATION RLS POLICIES
-- ===================================================================
-- This script fixes the RLS policies to allow user self-registration
-- while maintaining security for other operations.
-- ===================================================================

-- 1. Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can insert their own record during registration" ON public.users;
DROP POLICY IF EXISTS "Allow user self-registration" ON public.users;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;

-- 2. Create policy to allow users to insert their own record during registration
-- This policy allows INSERT if the user's auth.uid() matches the id being inserted
CREATE POLICY "Users can insert their own record during registration"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 3. Verify existing SELECT policy exists (users can read their own data)
-- If it doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile"
        ON public.users
        FOR SELECT
        TO authenticated
        USING (id = auth.uid() OR is_admin(auth.uid()));
    END IF;
END $$;

-- 4. Ensure pending_registrations table has user_id column
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.pending_registrations 
        ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        
        -- Add unique constraint
        ALTER TABLE public.pending_registrations 
        ADD CONSTRAINT pending_registrations_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 5. Fix pending_registrations policies
DROP POLICY IF EXISTS "Users can insert their own pending registration" ON public.pending_registrations;
DROP POLICY IF EXISTS "Users can view their own pending registration" ON public.pending_registrations;
DROP POLICY IF EXISTS "Admins can view all pending registrations" ON public.pending_registrations;

-- Allow users to insert their own pending registration
CREATE POLICY "Users can insert their own pending registration"
ON public.pending_registrations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to view their own pending registration
CREATE POLICY "Users can view their own pending registration"
ON public.pending_registrations
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Allow admins to manage all pending registrations
CREATE POLICY "Admins can manage all pending registrations"
ON public.pending_registrations
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 6. Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies
WHERE tablename IN ('users', 'pending_registrations')
    AND schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 7. Test the setup (this should work now)
-- You can run this as a test after fixing policies:
-- SELECT current_user, session_user, auth.uid();

-- ===================================================================
-- SETUP COMPLETE!
-- ===================================================================
-- 
-- After running this script:
-- 1. Users should be able to register successfully
-- 2. Profile image upload will still fail (we'll fix that next)
-- 3. Users can login after confirming their email
-- 
-- Next: We need to fix the storage policies for profiles bucket
-- ===================================================================
