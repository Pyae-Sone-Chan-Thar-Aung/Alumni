-- Database Diagnostic Script for Admin Access Issues
-- Run these queries in your Supabase SQL Editor to diagnose the problem

-- 1. Check if any users exist in the database
SELECT COUNT(*) as total_users FROM public.users;

-- 2. Check admin users
SELECT id, email, first_name, last_name, role, is_verified, created_at 
FROM public.users 
WHERE role = 'admin';

-- 3. Check all users with their verification status
SELECT id, email, first_name, last_name, role, is_verified, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- 4. Check user profiles
SELECT COUNT(*) as total_profiles FROM public.user_profiles;

-- 5. Check users with their profiles (using the view)
SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_verified, u.created_at,
       up.batch_year, up.course, up.phone
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
ORDER BY u.created_at DESC;

-- 6. Check specifically for pending users (unverified)
SELECT u.id, u.email, u.first_name, u.last_name, u.is_verified, u.created_at,
       up.batch_year, up.course
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.is_verified = false
ORDER BY u.created_at DESC;

-- 7. Test admin functions
-- Note: Replace 'ADMIN_UUID_HERE' with the actual admin user UUID from auth.users
-- SELECT is_admin('ADMIN_UUID_HERE') as is_admin_check;
-- SELECT get_user_role('ADMIN_UUID_HERE') as admin_role;

-- 8. Check RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';

-- 9. Check RLS policies on user_profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 10. Check if the current user (when logged in as admin) can see pending users
-- This will only work when executed by the admin user through the application
-- You can test this by running it in the Supabase SQL Editor while logged in as admin
-- SELECT * FROM public.users WHERE is_verified = false;

-- 11. Create a test pending user (for testing purposes)
-- Uncomment and run this to create a test user
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- This simulates what would happen during registration
    -- First insert would fail in auth.users (we can't do that from SQL)
    -- So we'll just insert into public.users with a random UUID
    
    INSERT INTO public.users (id, email, first_name, last_name, role, is_verified)
    VALUES (
        test_user_id,
        'test.pending@uic.edu.ph',
        'Test',
        'Pending User',
        'alumni',
        false
    );
    
    INSERT INTO public.user_profiles (user_id, batch_year, course, phone)
    VALUES (
        test_user_id,
        2023,
        'BS Computer Science',
        '+63 912 345 6789'
    );
    
    RAISE NOTICE 'Test pending user created with ID: %', test_user_id;
END $$;
*/

-- 12. If you created the test user above, check if admin can see it
-- SELECT * FROM public.users WHERE email = 'test.pending@uic.edu.ph';
