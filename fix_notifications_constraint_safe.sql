-- ===================================================================
-- FIX NOTIFICATIONS TYPE CHECK CONSTRAINT (SAFE VERSION)
-- ===================================================================
-- This version checks existing data first and handles any conflicts
-- ===================================================================

-- Step 1: Check what notification types currently exist
SELECT DISTINCT type, COUNT(*) as count
FROM public.notifications
GROUP BY type
ORDER BY type;

-- Step 2: Drop the existing CHECK constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Step 3: Update any invalid notification types to a valid value
-- (Map unknown types to 'general')
UPDATE public.notifications
SET type = CASE 
    WHEN type NOT IN (
        'registration_approved',
        'registration_rejected',
        'job_approved',
        'job_rejected',
        'news',
        'announcement',
        'message',
        'event',
        'system',
        'general'
    ) THEN 'general'
    ELSE type
END
WHERE type NOT IN (
    'registration_approved',
    'registration_rejected',
    'job_approved',
    'job_rejected',
    'news',
    'announcement',
    'message',
    'event',
    'system',
    'general'
);

-- Step 4: Create new constraint with all notification types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'registration_approved',
    'registration_rejected',
    'job_approved',
    'job_rejected',
    'news',
    'announcement',
    'message',
    'event',
    'system',
    'general'
));

-- Step 5: Verify the constraint was added
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'notifications_type_check';

-- Step 6: Check current notification types (should all be valid now)
SELECT DISTINCT type, COUNT(*) as count
FROM public.notifications
GROUP BY type
ORDER BY type;

-- Step 7: Show all notifications for review
SELECT 
    id,
    user_id,
    type,
    title,
    LEFT(message, 50) as message_preview,
    link_url,
    is_read,
    created_at
FROM public.notifications
ORDER BY created_at DESC
LIMIT 10;
