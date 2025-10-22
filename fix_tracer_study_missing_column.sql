-- Quick Fix: Add Missing additional_training Column
-- Run this in your Supabase SQL Editor

-- Check current table structure first
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tracer_study_responses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add the missing column
ALTER TABLE public.tracer_study_responses 
ADD COLUMN IF NOT EXISTS additional_training TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tracer_study_responses' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Missing additional_training column added successfully!' as status;