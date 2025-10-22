-- Test storage bucket configuration
SELECT * FROM storage.buckets WHERE id = 'profiles';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%profile%';

-- Check if user_profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
