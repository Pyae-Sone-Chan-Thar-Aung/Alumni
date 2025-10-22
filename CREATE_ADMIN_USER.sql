-- ===================================================================
-- CREATE ADMIN USER
-- ===================================================================
-- This script creates an admin user in the users table
-- matching the auth.users record
-- ===================================================================

-- First, let's check if the admin exists in auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'paung_230000001724@uic.edu.ph';

-- If you see a result above, copy the ID and use it below
-- If not, we'll create the auth user first

-- Option 1: If admin already exists in auth.users, insert into users table
-- REPLACE 'PASTE-UUID-HERE' with the actual UUID from the query above
/*
INSERT INTO public.users (id, email, first_name, last_name, role, approval_status, is_verified, approved_at, registration_date)
VALUES (
    'PASTE-UUID-HERE'::uuid,  -- Replace with actual UUID from auth.users
    'paung_230000001724@uic.edu.ph',
    'Admin',
    'User',
    'admin',
    'approved',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    approval_status = 'approved',
    is_verified = true;
*/

-- Option 2: If you need to create a NEW admin user completely
-- UNCOMMENT THIS SECTION AND RUN IT

-- First check if user already exists
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'paung_230000001724@uic.edu.ph';
BEGIN
    -- Try to find existing auth user
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;
    
    IF admin_user_id IS NOT NULL THEN
        -- Auth user exists, create/update in users table
        INSERT INTO public.users (
            id, 
            email, 
            first_name, 
            last_name, 
            role, 
            approval_status, 
            is_verified, 
            approved_at,
            registration_date
        )
        VALUES (
            admin_user_id,
            admin_email,
            'Admin',
            'User',
            'admin',
            'approved',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            approval_status = 'approved',
            is_verified = true,
            approved_at = NOW();
        
        RAISE NOTICE 'Admin user created/updated with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No auth user found for %. Please create via Supabase Dashboard first.', admin_email;
    END IF;
END $$;

-- Verify admin user was created
SELECT id, email, first_name, last_name, role, approval_status, is_verified
FROM public.users
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Also create a user profile for the admin
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id
    FROM public.users
    WHERE email = 'paung_230000001724@uic.edu.ph';
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (
            user_id,
            first_name,
            last_name,
            country
        )
        VALUES (
            admin_user_id,
            'Admin',
            'User',
            'Philippines'
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Admin profile created';
    END IF;
END $$;

-- Final verification
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.approval_status,
    up.user_id as has_profile
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.email = 'paung_230000001724@uic.edu.ph';

-- ===================================================================
-- IMPORTANT NOTES:
-- ===================================================================
-- If the admin doesn't exist in auth.users at all, you need to:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → Manual
-- 3. Email: paung_230000001724@uic.edu.ph
-- 4. Password: UICalumni2025
-- 5. Auto-confirm user: YES
-- 6. Then run this script again
-- ===================================================================
