-- Create Admin User: paung_230000001724@uic.edu.ph
-- Password: UICalumni2025
-- Run this script in your Supabase SQL Editor

-- First, let's create a UUID for the new admin user
-- You'll need to replace 'USER_UUID_HERE' with an actual UUID

-- Step 1: Insert into auth.users table (this creates the authentication account)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  gen_random_uuid(), -- This generates a random UUID
  '00000000-0000-0000-0000-000000000000',
  'paung_230000001724@uic.edu.ph',
  crypt('UICalumni2025', gen_salt('bf')), -- This encrypts the password
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  NULL
);

-- Step 2: Get the user ID we just created
-- (We'll use this in the next steps)

-- Step 3: Insert into users table (your application's user table)
INSERT INTO users (
  id,
  email,
  role,
  status,
  email_verified,
  created_at,
  last_login
) 
SELECT 
  id,
  'paung_230000001724@uic.edu.ph',
  'admin',
  'approved',
  true,
  NOW(),
  NULL
FROM auth.users 
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Step 4: Insert into user_profiles table
INSERT INTO user_profiles (
  user_id,
  first_name,
  last_name,
  program,
  graduation_year,
  current_job,
  company,
  phone,
  address,
  city,
  country,
  profile_image_url,
  bio,
  linkedin_url,
  created_at,
  updated_at
)
SELECT 
  id,
  'Admin',
  'User',
  'System Administrator',
  NULL,
  'System Administrator',
  'UIC CCS Alumni Portal',
  NULL,
  NULL,
  NULL,
  'Philippines',
  NULL,
  'System Administrator for CCS Alumni Portal',
  NULL,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Step 5: Verify the admin user was created
SELECT 
  u.id,
  u.email,
  u.role,
  u.status,
  up.first_name,
  up.last_name,
  up.current_job,
  up.company
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'paung_230000001724@uic.edu.ph';

-- Success message
SELECT 'Admin user created successfully!' as message,
       'Email: paung_230000001724@uic.edu.ph' as email,
       'Password: UICalumni2025' as password,
       'Role: admin' as role;
