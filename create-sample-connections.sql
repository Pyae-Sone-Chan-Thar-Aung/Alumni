-- ===================================================================
-- CREATE SAMPLE CONNECTIONS FOR TESTING MESSAGING SYSTEM
-- ===================================================================
-- This script creates sample user connections so you can test the messaging system
-- Run this in your Supabase SQL Editor
-- ===================================================================

-- ===================================================================
-- SECTION 1: CREATE SAMPLE CONNECTIONS
-- ===================================================================

-- Insert sample connections between all approved users
-- This creates bidirectional connections so everyone can message everyone
INSERT INTO public.user_connections (
    requester_id,
    recipient_id,
    status,
    message,
    created_at,
    updated_at
)
SELECT 
    u1.id as requester_id,
    u2.id as recipient_id,
    'accepted' as status,
    'Hello ' || u2.first_name || '! Let''s connect for testing.' as message,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users u1
CROSS JOIN public.users u2
WHERE u1.id != u2.id  -- Don't connect user to themselves
AND u1.approval_status = 'approved'  -- Only approved users
AND u2.approval_status = 'approved'  -- Only approved users
ON CONFLICT (requester_id, recipient_id) DO NOTHING;  -- Avoid duplicates

-- ===================================================================
-- SECTION 2: VERIFY CONNECTIONS WERE CREATED
-- ===================================================================

-- Count total connections
DO $$
DECLARE
    total_connections INTEGER;
    accepted_connections INTEGER;
    user_count INTEGER;
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO user_count
    FROM public.users 
    WHERE approval_status = 'approved';
    
    -- Count total connections
    SELECT COUNT(*) INTO total_connections
    FROM public.user_connections;
    
    -- Count accepted connections
    SELECT COUNT(*) INTO accepted_connections
    FROM public.user_connections 
    WHERE status = 'accepted';
    
    RAISE NOTICE '📊 Connection Statistics:';
    RAISE NOTICE '   Total approved users: %', user_count;
    RAISE NOTICE '   Total connections: %', total_connections;
    RAISE NOTICE '   Accepted connections: %', accepted_connections;
    
    IF accepted_connections > 0 THEN
        RAISE NOTICE '✅ Sample connections created successfully!';
    ELSE
        RAISE NOTICE '❌ No connections were created. Check if users exist.';
    END IF;
END $$;

-- ===================================================================
-- SECTION 3: SHOW SAMPLE CONNECTIONS
-- ===================================================================

-- Display sample connections for verification
SELECT 
    uc.id,
    u1.first_name || ' ' || u1.last_name as requester_name,
    u1.email as requester_email,
    u2.first_name || ' ' || u2.last_name as recipient_name,
    u2.email as recipient_email,
    uc.status,
    uc.message,
    uc.created_at
FROM public.user_connections uc
JOIN public.users u1 ON uc.requester_id = u1.id
JOIN public.users u2 ON uc.recipient_id = u2.id
WHERE uc.status = 'accepted'
ORDER BY uc.created_at DESC
LIMIT 10;

-- ===================================================================
-- SECTION 4: CREATE SAMPLE MESSAGES (OPTIONAL)
-- ===================================================================

-- Insert some sample messages between connected users
INSERT INTO public.messages (
    sender_id,
    recipient_id,
    subject,
    content,
    is_read,
    created_at,
    updated_at
)
SELECT 
    uc.requester_id as sender_id,
    uc.recipient_id as recipient_id,
    'Welcome to the Alumni Portal!' as subject,
    'Hello! This is a test message to verify the messaging system is working properly. You can now send messages to other alumni you are connected with.' as content,
    false as is_read,
    NOW() as created_at,
    NOW() as updated_at
FROM public.user_connections uc
WHERE uc.status = 'accepted'
LIMIT 3  -- Only create a few sample messages
ON CONFLICT DO NOTHING;

-- ===================================================================
-- SCRIPT COMPLETION
-- ===================================================================

SELECT 
    'SAMPLE CONNECTIONS CREATED SUCCESSFULLY!' as status,
    'You can now test the messaging system by composing messages to connected users.' as message,
    NOW() as completed_at;

-- ===================================================================
-- NEXT STEPS:
-- ===================================================================
-- 1. Go to your application's Messages page
-- 2. Click on "Compose" 
-- 3. You should now see recipients in the "To:" dropdown
-- 4. Select a recipient and send a test message
-- 5. Check the "Inbox" to see received messages
-- 6. Test the full messaging workflow
-- ===================================================================
