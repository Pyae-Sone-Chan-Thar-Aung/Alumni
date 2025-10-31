-- ===================================================================
-- FIX NOTIFICATIONS TABLE
-- ===================================================================
-- Add the missing link_url column that the job approval trigger needs
-- ===================================================================

-- Add link_url column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Show the trigger that uses this column
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_notify_job_decision';

-- Test: List any existing notifications
SELECT 
    id,
    user_id,
    type,
    title,
    message,
    link_url,
    is_read,
    created_at
FROM public.notifications
ORDER BY created_at DESC
LIMIT 5;
