-- Fix News Category Constraint to Match Frontend Options
-- Compatible with modern PostgreSQL versions
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE public.news 
DROP CONSTRAINT IF EXISTS news_category_check;

-- Add the new constraint with all the categories used in your frontend
ALTER TABLE public.news 
ADD CONSTRAINT news_category_check 
CHECK (category IN (
    'Announcement',
    'Event', 
    'Career',
    'Academic',
    'Alumni News',
    'University Update'
));

-- Update any existing records that might have invalid categories
-- (Set them to 'Announcement' as default)
UPDATE public.news 
SET category = 'Announcement' 
WHERE category NOT IN (
    'Announcement',
    'Event', 
    'Career',
    'Academic',
    'Alumni News',
    'University Update'
);

-- Verify the constraint was applied (modern PostgreSQL compatible query)
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'news_category_check';

-- Check current categories in the table
SELECT DISTINCT category, COUNT(*) as count
FROM public.news 
GROUP BY category 
ORDER BY category;

-- Show table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'news' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'News category constraint updated successfully!' as status;