-- ===================================================================
-- FIX USER_PROFILES TABLE - ADD MISSING COLUMNS
-- ===================================================================

-- Add all missing columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS program TEXT;

-- Verify all columns exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ===================================================================
-- COMPLETED!
-- ===================================================================
