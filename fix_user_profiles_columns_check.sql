-- ===================================================================
-- CHECK AND FIX USER_PROFILES TABLE COLUMNS
-- ===================================================================
-- This script will show current columns and add missing ones

-- 1. First, let's see what columns currently exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Add missing columns if they don't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS program TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS current_job_title TEXT,
ADD COLUMN IF NOT EXISTS current_company TEXT,
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS batch_year INTEGER,
ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- 3. If there's an old 'course' column, copy data to 'program' and keep it for backward compatibility
-- (We'll keep both to avoid breaking anything)
DO $$
BEGIN
    -- Check if 'course' column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'course'
    ) THEN
        -- Copy course data to program if program is null
        UPDATE public.user_profiles 
        SET program = course 
        WHERE program IS NULL AND course IS NOT NULL;
    END IF;

    -- Check if 'current_job' column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'current_job'
    ) THEN
        -- Copy current_job data to current_job_title if current_job_title is null
        UPDATE public.user_profiles 
        SET current_job_title = current_job 
        WHERE current_job_title IS NULL AND current_job IS NOT NULL;
    END IF;

    -- Check if 'company' column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'company'
    ) THEN
        -- Copy company data to current_company if current_company is null
        UPDATE public.user_profiles 
        SET current_company = company 
        WHERE current_company IS NULL AND company IS NOT NULL;
    END IF;
END $$;

-- 4. Verify the columns now exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name IN ('program', 'date_of_birth', 'postal_code', 'current_job_title', 'current_company', 'batch_year', 'graduation_year')
ORDER BY column_name;

-- ===================================================================
-- COMPLETED! 
-- Now run this in your Supabase SQL Editor
-- ===================================================================
