-- Test script to verify the messaging system database is working correctly

-- 1. Check if tables exist and have correct structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_connections', 'messages', 'notifications')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('user_connections', 'messages', 'notifications')
    AND schemaname = 'public';

-- 3. Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('user_connections', 'messages')
    AND event_object_schema = 'public';

-- 4. Check if functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('create_connection_notification', 'create_message_notification', 'mark_message_read')
    AND routine_schema = 'public';

-- 5. Test inserting a sample message (replace with actual user IDs)
-- This will only work if you have actual user IDs in your users table
/*
INSERT INTO public.messages (sender_id, recipient_id, subject, content)
VALUES (
    (SELECT id FROM public.users LIMIT 1),
    (SELECT id FROM public.users LIMIT 1 OFFSET 1),
    'Test Message',
    'This is a test message to verify the messaging system is working.'
);
*/

-- 6. Show current user count
SELECT COUNT(*) as total_users FROM public.users;

-- 7. Show if there are any existing messages
SELECT COUNT(*) as total_messages FROM public.messages;

-- 8. Show if there are any existing connections
SELECT COUNT(*) as total_connections FROM public.user_connections;

-- 9. Show if there are any existing notifications
SELECT COUNT(*) as total_notifications FROM public.notifications;
