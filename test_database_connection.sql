-- Test database connection and RLS policies
-- Run this to verify everything is working

-- 1. Check if user is authenticated (this will show the current user)
SELECT auth.uid() as current_user_id;

-- 2. Test if we can read from messages table
SELECT COUNT(*) as message_count FROM public.messages;

-- 3. Test if we can read from user_connections table
SELECT COUNT(*) as connection_count FROM public.user_connections;

-- 4. Test if we can read from notifications table
SELECT COUNT(*) as notification_count FROM public.notifications;

-- 5. Test inserting a simple message (replace with actual user IDs)
-- This will help identify RLS issues
/*
INSERT INTO public.messages (sender_id, recipient_id, subject, content)
VALUES (
    auth.uid(),
    auth.uid(),
    'Test Message',
    'This is a test message to verify RLS policies.'
);
*/

-- 6. Show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_connections', 'messages', 'notifications')
    AND schemaname = 'public';

-- 7. Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_connections', 'messages', 'notifications')
    AND schemaname = 'public';
