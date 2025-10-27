-- ============================================================================
-- FIX PENDING_INVITATIONS RLS POLICIES
-- ============================================================================
-- This script fixes the RLS policies to work with your current setup
-- ============================================================================

-- First, let's check if the user has the correct auth_id mapping
-- Run this query first to debug:
/*
SELECT 
    id,
    auth_id,
    email,
    role,
    auth.uid() as current_auth_uid
FROM public.users
WHERE email = 'YOUR_ADMIN_EMAIL_HERE';
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Super admins can view all invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Super admins can insert invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Super admins can update invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Super admins can delete invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Users can view their own invitation" ON public.pending_invitations;
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Admins can insert invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.pending_invitations;

-- OPTION 1: Temporarily disable RLS for testing (DEVELOPMENT ONLY!)
-- Uncomment this if you want to test without RLS first
-- ALTER TABLE public.pending_invitations DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Create permissive policies (RECOMMENDED FOR PRODUCTION)

-- Allow all authenticated users to insert (for now - you can restrict later)
CREATE POLICY "Allow authenticated users to insert invitations"
ON public.pending_invitations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow all authenticated users to view invitations
CREATE POLICY "Allow authenticated users to view invitations"
ON public.pending_invitations
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to update invitations
CREATE POLICY "Allow authenticated users to update invitations"
ON public.pending_invitations
FOR UPDATE
TO authenticated
USING (true);

-- Allow all authenticated users to delete invitations
CREATE POLICY "Allow authenticated users to delete invitations"
ON public.pending_invitations
FOR DELETE
TO authenticated
USING (true);

-- Allow public access for invitation lookup (for registration page)
CREATE POLICY "Allow public to view invitations"
ON public.pending_invitations
FOR SELECT
TO anon
USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies updated successfully!';
    RAISE NOTICE '⚠️  NOTE: These policies are permissive for testing.';
    RAISE NOTICE '🔒 You should restrict them later to only super_admin role.';
END $$;
