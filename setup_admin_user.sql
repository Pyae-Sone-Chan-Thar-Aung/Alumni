-- Setup Admin User Script
-- Run this in your Supabase SQL Editor

-- Step 1: First, check if you have any admin users
SELECT id, email, first_name, last_name, role, is_verified 
FROM public.users 
WHERE role = 'admin';

-- Step 2: If no admin users exist, you need to:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find your admin user (paung_230000001724@uic.edu.ph)
-- 3. Copy the UUID from the id column
-- 4. Replace 'YOUR_ADMIN_UUID_HERE' below with that UUID and uncomment the lines

/*
INSERT INTO public.users (id, email, first_name, last_name, role, is_verified)
VALUES (
  'YOUR_ADMIN_UUID_HERE', -- Replace with actual UUID from auth.users
  'paung_230000001724@uic.edu.ph',
  'Paung',
  'Admin',
  'admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_verified = true;
*/

-- Step 3: Verify the admin user was created/updated correctly
SELECT id, email, first_name, last_name, role, is_verified 
FROM public.users 
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Step 4: Test admin functions
-- SELECT is_admin('YOUR_ADMIN_UUID_HERE'); -- Should return true

-- Step 5: Test that admin can see pending users
-- SELECT id, email, first_name, last_name, is_verified 
-- FROM public.users 
-- WHERE is_verified = false;
