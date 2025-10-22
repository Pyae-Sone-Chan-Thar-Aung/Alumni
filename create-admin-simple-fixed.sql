-- Simple Admin Creation - FIXED VERSION
-- This assumes the user already exists in auth.users (created through Supabase Dashboard)

-- Step 1: First create the user through Supabase Dashboard:
-- Go to Authentication > Users > Add User
-- Email: paung_230000001724@uic.edu.ph
-- Password: UICalumni2025
-- Auto Confirm: YES

-- Step 2: Then run this SQL to make them admin:

-- Insert into users table with a placeholder password hash
-- (The real authentication is handled by Supabase Auth)
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
  'supabase_auth_managed', -- Placeholder since Supabase handles auth
  'admin',
  'approved',
  true,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'paung_230000001724@uic.edu.ph'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'approved',
  password_hash = 'supabase_auth_managed';

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
WHERE au.email = 'paung_230000001724@uic.edu.ph'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = 'Admin',
  last_name = 'User',
  current_job = 'System Administrator',
  company = 'UIC CCS Alumni Portal',
  bio = 'System Administrator for CCS Alumni Portal',
  updated_at = NOW();

-- Step 4: Verify the admin user
SELECT 
  u.id,
  u.email,
  u.password_hash,
  u.role,
  u.status,
  up.first_name,
  up.last_name,
  up.current_job
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'paung_230000001724@uic.edu.ph';

-- Success message
SELECT 
  'Admin user created successfully!' as message,
  'Email: paung_230000001724@uic.edu.ph' as login_email,
  'Password: UICalumni2025' as login_password,
  'Role: admin' as user_role;
