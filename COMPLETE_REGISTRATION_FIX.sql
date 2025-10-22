-- ===================================================================
-- COMPLETE REGISTRATION FIX
-- ===================================================================
-- This fixes all registration issues in one script
-- ===================================================================

-- 1. ENSURE RLS IS ENABLED BUT POLICIES ALLOW REGISTRATION
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING POLICIES AND RECREATE THEM CORRECTLY
DROP POLICY IF EXISTS "Users can insert their own record during registration" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Allow authenticated users to INSERT their own record (for registration)
CREATE POLICY "Users can insert their own record during registration"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Allow users to SELECT their own record
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow admins to SELECT all users
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow admins to UPDATE/DELETE all users
CREATE POLICY "Admins can manage all users"
ON public.users
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 3. FIX USER_PROFILES POLICIES
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Allow users to INSERT their own profile
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to SELECT their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to SELECT all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. VERIFY POLICIES WERE CREATED
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('users', 'user_profiles')
ORDER BY tablename, cmd, policyname;

-- 5. TEST: Check if we can see users (this should work as admin)
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    approval_status,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- ===================================================================
-- NOTES FOR ADMIN DASHBOARD
-- ===================================================================
-- 
-- Your admin dashboard should query:
-- 
-- SELECT * FROM public.users WHERE approval_status = 'pending'
-- 
-- Or for more details:
-- 
-- SELECT 
--     u.id,
--     u.email,
--     u.first_name,
--     u.last_name,
--     u.approval_status,
--     u.created_at,
--     up.phone,
--     up.course,
--     up.graduation_year
-- FROM public.users u
-- LEFT JOIN public.user_profiles up ON u.id = up.user_id
-- WHERE u.approval_status = 'pending'
-- ORDER BY u.created_at DESC;
-- 
-- ===================================================================
