-- Add missing columns and create sample alumni for better batchmates testing

-- Add required columns first
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS batch_year INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_job TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Update existing users with realistic data
-- Admin user
UPDATE public.users 
SET 
  batch_year = 2019,
  course = 'BS Computer Science',
  current_job = 'System Administrator',
  company = 'UIC - College of Computer Studies',
  location = 'Davao City, Philippines',
  last_login_at = NOW()
WHERE email = 'paung_230000001724@uic.edu.ph';

-- Alumni user 1 - Ma. Nicole Morales
UPDATE public.users 
SET 
  batch_year = 2024,
  course = 'BS Computer Science',
  current_job = 'Software Developer',
  company = 'Tech Solutions Inc.',
  location = 'Davao City, Philippines',
  last_login_at = NOW() - INTERVAL '2 hours'
WHERE email = 'kalaylay.ktg@gmail.com';

-- Alumni user 2 - Sai Sao  
UPDATE public.users 
SET 
  batch_year = 2024,
  course = 'BS Information Technology',
  current_job = 'Web Developer',
  company = 'Digital Agency Co.',
  location = 'Davao City, Philippines', 
  last_login_at = NOW() - INTERVAL '1 day'
WHERE email = 'pyaesonechantharaung25@gmail.com';

-- Add sample alumni users for better testing
-- These are fictional users for demonstration
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  approval_status,
  is_verified,
  is_active,
  registration_date,
  approved_at,
  created_at,
  updated_at,
  batch_year,
  course,
  current_job,
  company,
  location,
  last_login_at
) VALUES 
(
  gen_random_uuid(),
  'juan.delacruz@sample.com',
  'Juan',
  'Dela Cruz',
  'alumni',
  'approved',
  true,
  true,
  NOW() - INTERVAL '1 year',
  NOW() - INTERVAL '11 months',
  NOW() - INTERVAL '1 year',
  NOW() - INTERVAL '1 month',
  2024,
  'BS Computer Science',
  'Full Stack Developer',
  'TechCorp Philippines',
  'Manila, Philippines',
  NOW() - INTERVAL '3 hours'
),
(
  gen_random_uuid(),
  'maria.santos@sample.com',
  'Maria',
  'Santos',
  'alumni',
  'approved',
  true,
  true,
  NOW() - INTERVAL '1 year 2 months',
  NOW() - INTERVAL '1 year',
  NOW() - INTERVAL '1 year 2 months',
  NOW() - INTERVAL '2 weeks',
  2024,
  'BS Information Technology',
  'UI/UX Designer',
  'Design Studio Inc.',
  'Cebu City, Philippines',
  NOW() - INTERVAL '5 hours'
),
(
  gen_random_uuid(),
  'robert.garcia@sample.com',
  'Robert',
  'Garcia',
  'alumni',
  'approved',
  true,
  true,
  NOW() - INTERVAL '10 months',
  NOW() - INTERVAL '9 months',
  NOW() - INTERVAL '10 months',
  NOW() - INTERVAL '1 week',
  2023,
  'BS Computer Science',
  'DevOps Engineer',
  'Cloud Solutions Ltd.',
  'Makati City, Philippines',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'ana.reyes@sample.com',
  'Ana',
  'Reyes',
  'alumni',
  'approved',
  true,
  true,
  NOW() - INTERVAL '8 months',
  NOW() - INTERVAL '7 months',
  NOW() - INTERVAL '8 months',
  NOW() - INTERVAL '3 days',
  2023,
  'BS Information Systems',
  'Business Analyst',
  'Corporate Solutions Inc.',
  'Davao City, Philippines',
  NOW() - INTERVAL '6 hours'
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_batch_year ON public.users(batch_year);
CREATE INDEX IF NOT EXISTS idx_users_role_verified ON public.users(role, is_verified);

-- Show the results
SELECT 
  'Sample alumni users created!' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'alumni') as alumni_users,
  COUNT(*) FILTER (WHERE batch_year = 2024) as batch_2024_users,
  COUNT(*) FILTER (WHERE batch_year = 2023) as batch_2023_users
FROM public.users;

-- Show batch distribution
SELECT 
  batch_year,
  COUNT(*) as user_count,
  string_agg(first_name || ' ' || last_name, ', ') as members
FROM public.users
WHERE role = 'alumni' AND is_verified = true
GROUP BY batch_year
ORDER BY batch_year DESC;