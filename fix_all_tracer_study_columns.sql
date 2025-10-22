-- Complete Fix: Add All Missing Tracer Study Columns
-- Run this in your Supabase SQL Editor
-- This will add missing columns without deleting existing data

-- First, check what columns currently exist
SELECT 'Current table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tracer_study_responses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add all missing columns that the form expects
ALTER TABLE public.tracer_study_responses 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS sex TEXT,
ADD COLUMN IF NOT EXISTS civil_status TEXT,
ADD COLUMN IF NOT EXISTS degree TEXT,
ADD COLUMN IF NOT EXISTS major TEXT,
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS honors TEXT,
ADD COLUMN IF NOT EXISTS employment_status TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS work_location TEXT,
ADD COLUMN IF NOT EXISTS monthly_salary TEXT,
ADD COLUMN IF NOT EXISTS employment_type TEXT,
ADD COLUMN IF NOT EXISTS first_job_related BOOLEAN,
ADD COLUMN IF NOT EXISTS job_search_duration TEXT,
ADD COLUMN IF NOT EXISTS job_search_method TEXT,
ADD COLUMN IF NOT EXISTS started_job_search TEXT,
ADD COLUMN IF NOT EXISTS curriculum_helpful BOOLEAN,
ADD COLUMN IF NOT EXISTS important_skills TEXT,
ADD COLUMN IF NOT EXISTS additional_training TEXT,
ADD COLUMN IF NOT EXISTS program_satisfaction TEXT,
ADD COLUMN IF NOT EXISTS university_preparation TEXT,
ADD COLUMN IF NOT EXISTS suggestions TEXT,
ADD COLUMN IF NOT EXISTS recommend_program BOOLEAN,
ADD COLUMN IF NOT EXISTS gender TEXT; -- This is used for analytics

-- Verify all columns were added
SELECT 'Updated table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tracer_study_responses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count existing records to ensure no data was lost
SELECT 'Total records in table: ' || COUNT(*) as record_count
FROM public.tracer_study_responses;

SELECT 'All missing tracer study columns have been added successfully!' as status;