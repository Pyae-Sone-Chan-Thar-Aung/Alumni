-- ===================================================================
-- FIX NOTIFICATIONS TYPE CHECK CONSTRAINT
-- ===================================================================
-- The trigger tries to insert 'job_approved' and 'job_rejected' types
-- but the CHECK constraint doesn't allow them
-- ===================================================================

-- Step 1: Drop the existing CHECK constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Step 2: Create new constraint with all notification types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'registration_approved',
    'registration_rejected',
    'job_approved',          -- ADD THIS
    'job_rejected',          -- ADD THIS
    'news',
    'announcement',
    'message',
    'event',                 -- Additional type
    'system',                -- Additional type
    'general'                -- Additional type
));

-- Step 3: Verify the constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'notifications_type_check';

-- Step 4: Check existing notification types
SELECT DISTINCT type, COUNT(*) as count
FROM public.notifications
GROUP BY type
ORDER BY type;

-- Step 5: Show the triggers that create notifications
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%notify%'
ORDER BY trigger_name;
