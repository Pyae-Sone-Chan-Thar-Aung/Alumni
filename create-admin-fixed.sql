-- Create Admin User: paung_230000001724@uic.edu.ph
-- Password: UICalumni2025
-- FIXED VERSION - includes password_hash

-- Step 1: Create user in auth.users table first
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
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'paung_230000001724@uic.edu.ph',
  crypt('UICalumni2025', gen_salt('bf')),
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

-- Step 2: Insert into users table with password_hash
INSERT INTO users (
  id,
  email,
  password_hash,
  role,
  status,
  email_verified,
  created_at,
  updated_at
) 
SELECT 
  au.id,
  'paung_230000001724@uic.edu.ph',
  '$2b$12$UICalumni2025HashPlaceholder', -- Placeholder hash
  'admin',
  'approved',
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'paung_230000001724@uic.edu.ph';

-- Step 3: Create admin profile
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
  au.id,
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
FROM auth.users au
WHERE au.email = 'paung_230000001724@uic.edu.ph';

-- Step 4: Verify the admin user was created
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
