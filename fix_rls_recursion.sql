-- Fix RLS Infinite Recursion Issue
-- This script fixes the circular reference in RLS policies

-- First, disable RLS temporarily to fix the policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE pending_registrations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can update user approval status" ON users;

DROP POLICY IF EXISTS "Users can view their own user_profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own user_profile" ON user_profiles;

DROP POLICY IF EXISTS "Admins can manage pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Users can view their own pending registration" ON pending_registrations;

-- Create a function to check if current user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users au
    JOIN users u ON au.id = u.id
    WHERE au.id = auth.uid() AND u.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Create new policies with is_admin() function to avoid recursion
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "pending_registrations_select_policy" ON pending_registrations;
DROP POLICY IF EXISTS "pending_registrations_insert_policy" ON pending_registrations;
DROP POLICY IF EXISTS "pending_registrations_update_policy" ON pending_registrations;
DROP POLICY IF EXISTS "pending_registrations_delete_policy" ON pending_registrations;

CREATE POLICY "users_select_policy" ON users
FOR SELECT USING (
  id = auth.uid() OR is_admin()
);

CREATE POLICY "users_insert_policy" ON users
FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_policy" ON users
FOR UPDATE USING (
  id = auth.uid() OR is_admin()
);

-- User profiles policies
CREATE POLICY "user_profiles_select_policy" ON user_profiles
FOR SELECT USING (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "user_profiles_insert_policy" ON user_profiles
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "user_profiles_update_policy" ON user_profiles
FOR UPDATE USING (
  user_id = auth.uid() OR is_admin()
);

-- Pending registrations policies
CREATE POLICY "pending_registrations_select_policy" ON pending_registrations
FOR SELECT USING (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "pending_registrations_insert_policy" ON pending_registrations
FOR INSERT WITH CHECK (true);

CREATE POLICY "pending_registrations_update_policy" ON pending_registrations
FOR UPDATE USING (is_admin());

CREATE POLICY "pending_registrations_delete_policy" ON pending_registrations
FOR DELETE USING (is_admin());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Update admin user to ensure it exists
INSERT INTO users (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    is_verified, 
    approval_status,
    registration_date,
    approved_at
) 
SELECT 
    au.id,
    au.email,
    'Admin',
    'User',
    'admin',
    true,
    'approved',
    NOW(),
    NOW()
FROM auth.users au 
WHERE au.email = 'paung_230000001724@uic.edu.ph'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_verified = true,
    approval_status = 'approved',
    first_name = COALESCE(users.first_name, 'Admin'),
    last_name = COALESCE(users.last_name, 'User');

COMMIT;
