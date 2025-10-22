-- Simple Admin User Creation
-- Run this in Supabase SQL Editor

-- Method 1: Create admin user in application tables only
-- (The user will need to sign up normally first, then we'll upgrade them to admin)

-- First, let's check if the user already exists
SELECT * FROM auth.users WHERE email = 'paung_230000001724@uic.edu.ph';

-- If the user doesn't exist in auth.users, they need to register first through your app
-- Then run this to make them admin:

-- Update existing user to admin (if they already registered)
UPDATE users 
SET role = 'admin', status = 'approved' 
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Create/Update their profile
INSERT INTO user_profiles (
  user_id,
  first_name,
  last_name,
  program,
  current_job,
  company,
  country,
  bio,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'Admin',
  'User', 
  'System Administrator',
  'System Administrator',
  'UIC CCS Alumni Portal',
  'Philippines',
  'System Administrator for CCS Alumni Portal',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'paung_230000001724@uic.edu.ph'
ON CONFLICT (user_id) 
DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  current_job = EXCLUDED.current_job,
  company = EXCLUDED.company,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Verify the admin user
SELECT 
  u.id,
  u.email,
  u.role,
  u.status,
  up.first_name,
  up.last_name,
  up.current_job
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'paung_230000001724@uic.edu.ph';
