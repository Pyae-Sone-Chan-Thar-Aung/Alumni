-- Fix News Table Schema - Add Missing Columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to news table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Announcement',
ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have published_at if they are published
UPDATE public.news 
SET published_at = created_at 
WHERE is_published = true AND published_at IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_important ON public.news(is_important);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at);

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'news' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'News table schema updated successfully! Added category, is_important, and published_at columns.' as status;
