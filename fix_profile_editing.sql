-- Fix Alumni Profile Editing Issues
-- This script ensures postal_code and date_of_birth can be edited

-- 1. First, ensure the columns exist in user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 2. Drop existing RLS policies for user_profiles that might be restrictive
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- 3. Create comprehensive RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (
    auth.uid() = user_id OR
    auth.role() = 'service_role'
);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (
    auth.uid() = user_id
) WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'super_admin')
    )
);

-- 4. Ensure RLS is enabled on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO service_role;

-- 6. Verification queries
SELECT 'Schema Check' as check_type, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name IN ('postal_code', 'date_of_birth');

SELECT 'RLS Policies' as check_type, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'user_profiles';

SELECT 'RLS Status' as check_type, rowsecurity::text as enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';