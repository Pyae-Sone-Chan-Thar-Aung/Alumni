-- Check user_profiles table schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Check if postal_code and date_of_birth columns exist
SELECT 
  CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING' END as postal_code_status
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'postal_code';

SELECT 
  CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING' END as date_of_birth_status
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'date_of_birth';

-- Check RLS policies on user_profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Check if RLS is enabled on user_profiles
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Test sample data (optional - check if there are any existing profiles)
SELECT COUNT(*) as total_profiles FROM user_profiles;