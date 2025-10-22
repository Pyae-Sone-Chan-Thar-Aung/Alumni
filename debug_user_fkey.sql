-- =========================================
-- DEBUG USER FOREIGN KEY ISSUE
-- =========================================
-- Run this to diagnose and fix the user foreign key problem

-- 1. Check if users table exists and has data
SELECT 'Checking users table...' as step;
SELECT COUNT(*) as user_count FROM public.users;
SELECT id, email, first_name, last_name, role FROM public.users LIMIT 5;

-- 2. Check if auth.users has data
SELECT 'Checking auth.users...' as step;
SELECT COUNT(*) as auth_user_count FROM auth.users;
SELECT id, email FROM auth.users LIMIT 5;

-- 3. Check for orphaned users (users in auth.users but not in public.users)
SELECT 'Checking for missing users in public.users...' as step;
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 4. If there are missing users, let's create them
INSERT INTO public.users (id, email, first_name, last_name, role, is_verified, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', 'User') as last_name,
    'alumni' as role,
    au.email_confirmed_at IS NOT NULL as is_verified,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Verify the fix
SELECT 'Users created/verified:' as step;
SELECT COUNT(*) as total_users FROM public.users;

-- 6. Check tracer_study_responses table structure
SELECT 'Tracer study table structure:' as step;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tracer_study_responses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Diagnosis complete. Check results above.' as status;
