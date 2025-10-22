-- Add missing columns to users table for batchmates functionality

-- Add batch_year column (required for batchmates)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS batch_year INTEGER;

-- Add optional columns for better profile information
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS course TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS current_job TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Update existing users with sample data (you can modify these values)
UPDATE public.users 
SET 
  batch_year = 2020,  -- Set default batch year
  course = 'BS Computer Science',  -- Set default course
  current_job = 'Software Developer',  -- Sample job
  company = 'Tech Company',  -- Sample company
  location = 'Davao City, Philippines',  -- Sample location
  last_login_at = NOW()  -- Set current time as last login
WHERE batch_year IS NULL;  -- Only update users who don't have batch_year set

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_batch_year ON public.users(batch_year);
CREATE INDEX IF NOT EXISTS idx_users_role_verified ON public.users(role, is_verified);

-- Show the updated structure
SELECT 
  'Users table updated successfully!' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE batch_year IS NOT NULL) as users_with_batch_year
FROM public.users;

-- Show sample data
SELECT 
  first_name, 
  last_name, 
  role, 
  batch_year, 
  course, 
  is_verified
FROM public.users
LIMIT 5;