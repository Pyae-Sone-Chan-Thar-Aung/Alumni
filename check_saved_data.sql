-- Check what data is actually saved in the user_profiles table
SELECT 
    user_id,
    date_of_birth,
    postal_code,
    first_name,
    last_name,
    updated_at
FROM user_profiles 
WHERE date_of_birth IS NOT NULL OR postal_code IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- Check if any profiles exist at all
SELECT COUNT(*) as total_profiles, 
       COUNT(date_of_birth) as profiles_with_dob,
       COUNT(postal_code) as profiles_with_postal
FROM user_profiles;

-- Check specific user profile (replace with your user ID)
-- SELECT * FROM user_profiles WHERE user_id = 'your-user-id-here';