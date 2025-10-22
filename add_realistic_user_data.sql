-- Add missing columns and realistic batch assignments for batchmates testing

-- Add required columns first
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS batch_year INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_job TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Set realistic data for individual users
-- Admin user - won't appear in batchmates (excluded by role filtering)
UPDATE public.users 
SET 
  batch_year = 2019,  -- Admin graduated earlier
  course = 'BS Computer Science',
  current_job = 'System Administrator',
  company = 'UIC - College of Computer Studies',
  location = 'Davao City, Philippines',
  last_login_at = NOW()
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Alumni user 1 - Ma. Nicole Morales
UPDATE public.users 
SET 
  batch_year = 2024,  -- Same batch for both alumni to see each other
  course = 'BS Computer Science',
  current_job = 'Software Developer',
  company = 'Tech Solutions Inc.',
  location = 'Davao City, Philippines',
  last_login_at = NOW() - INTERVAL '2 hours'
WHERE email = 'kalaylay.ktg@gmail.com';

-- Alumni user 2 - Sai Sao  
UPDATE public.users 
SET 
  batch_year = 2024,  -- Same batch as Nicole so they appear as batchmates
  course = 'BS Information Technology',
  current_job = 'Web Developer',
  company = 'Digital Agency Co.',
  location = 'Davao City, Philippines', 
  last_login_at = NOW() - INTERVAL '1 day'
WHERE email = 'pyaesonechantharaung25@gmail.com';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_batch_year ON public.users(batch_year);
CREATE INDEX IF NOT EXISTS idx_users_role_verified ON public.users(role, is_verified);

-- Show the results
SELECT 
  'User data updated successfully!' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'alumni') as alumni_users,
  COUNT(*) FILTER (WHERE batch_year IS NOT NULL) as users_with_batch_year
FROM public.users;

-- Show updated user details
SELECT 
  first_name || ' ' || last_name as full_name,
  email,
  role,
  batch_year,
  course,
  current_job,
  company,
  is_verified
FROM public.users
ORDER BY role, batch_year;