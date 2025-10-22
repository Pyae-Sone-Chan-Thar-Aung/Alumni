-- Fix Job Opportunities Table Schema - Add Missing Columns
-- Run this in your Supabase SQL Editor

-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'job_opportunities' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT 'Full-time';

-- If job_type already exists as enum, we might need to convert it
-- First check if it's an enum
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'job_opportunities' 
    AND column_name = 'job_type';

-- Update job_type to allow the correct enum values if needed
-- (Skip this if job_type is already correct)
-- DROP TYPE IF EXISTS job_type_enum CASCADE;
-- CREATE TYPE job_type_enum AS ENUM ('Full-time', 'Part-time', 'Contract', 'Internship');
-- ALTER TABLE public.job_opportunities ALTER COLUMN job_type TYPE job_type_enum USING job_type::job_type_enum;

-- Verify the final schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'job_opportunities' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Job opportunities table schema updated successfully!' as status;