-- Fix Batchmates Database Issues
-- This script ensures all required columns exist for proper batchmates functionality

-- 1. Add missing columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS batch_year INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_job TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 2. Ensure pending_registrations table has all required columns
CREATE TABLE IF NOT EXISTS public.pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    course VARCHAR(100),
    batch_year INTEGER,
    graduation_year INTEGER,
    current_job VARCHAR(100),
    company VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    student_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to pending_registrations if they don't exist
ALTER TABLE public.pending_registrations ADD COLUMN IF NOT EXISTS batch_year INTEGER;
ALTER TABLE public.pending_registrations ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE public.pending_registrations ADD COLUMN IF NOT EXISTS current_job VARCHAR(100);
ALTER TABLE public.pending_registrations ADD COLUMN IF NOT EXISTS company VARCHAR(100);
ALTER TABLE public.pending_registrations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.pending_registrations ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE public.pending_registrations ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE public.pending_registrations ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_batch_year ON public.users(batch_year);
CREATE INDEX IF NOT EXISTS idx_users_role_verified ON public.users(role, is_verified);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON public.pending_registrations(email);

-- 4. Update existing users with sample data if they don't have batch_year
UPDATE public.users 
SET 
  batch_year = COALESCE(batch_year, 2020),
  course = COALESCE(course, 'BS Computer Science'),
  current_job = COALESCE(current_job, 'Software Developer'),
  company = COALESCE(company, 'Tech Company'),
  location = COALESCE(location, 'Davao City, Philippines'),
  last_login_at = COALESCE(last_login_at, NOW())
WHERE batch_year IS NULL;

-- 5. Show the updated structure
SELECT 
  'Users table updated successfully!' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE batch_year IS NOT NULL) as users_with_batch_year
FROM public.users;

-- 6. Show sample data
SELECT 
  first_name, 
  last_name, 
  role, 
  batch_year, 
  course, 
  is_verified
FROM public.users
LIMIT 5;
