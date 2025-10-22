-- Check the current constraint on news table category column
-- Run this in your Supabase SQL Editor

-- Get constraint information
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conname = 'news_category_check';

-- Get detailed column information
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'news' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current data in the table to see what values exist
SELECT DISTINCT category, COUNT(*) as count
FROM public.news 
GROUP BY category 
ORDER BY category;