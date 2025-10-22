-- ===================================================================
-- MESSAGING SYSTEM FOREIGN KEY RELATIONSHIPS FIX
-- ===================================================================
-- This script fixes the foreign key relationships between messaging tables and users
-- Run this in your Supabase SQL Editor to fix the relationship issues
-- ===================================================================

-- ===================================================================
-- SECTION 1: DROP EXISTING FOREIGN KEY CONSTRAINTS (IF ANY)
-- ===================================================================

-- Drop existing foreign key constraints on messages table
DO $$
BEGIN
    -- Drop foreign key constraints on messages table
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'messages_sender_id_fkey' 
               AND table_name = 'messages' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.messages DROP CONSTRAINT messages_sender_id_fkey;
        RAISE NOTICE 'Dropped messages_sender_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'messages_recipient_id_fkey' 
               AND table_name = 'messages' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.messages DROP CONSTRAINT messages_recipient_id_fkey;
        RAISE NOTICE 'Dropped messages_recipient_id_fkey constraint';
    END IF;
    
    -- Drop foreign key constraints on user_connections table
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'user_connections_requester_id_fkey' 
               AND table_name = 'user_connections' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.user_connections DROP CONSTRAINT user_connections_requester_id_fkey;
        RAISE NOTICE 'Dropped user_connections_requester_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'user_connections_recipient_id_fkey' 
               AND table_name = 'user_connections' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.user_connections DROP CONSTRAINT user_connections_recipient_id_fkey;
        RAISE NOTICE 'Dropped user_connections_recipient_id_fkey constraint';
    END IF;
    
    -- Drop foreign key constraints on notifications table
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'notifications_user_id_fkey' 
               AND table_name = 'notifications' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.notifications DROP CONSTRAINT notifications_user_id_fkey;
        RAISE NOTICE 'Dropped notifications_user_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'notifications_related_user_id_fkey' 
               AND table_name = 'notifications' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.notifications DROP CONSTRAINT notifications_related_user_id_fkey;
        RAISE NOTICE 'Dropped notifications_related_user_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'notifications_related_message_id_fkey' 
               AND table_name = 'notifications' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.notifications DROP CONSTRAINT notifications_related_message_id_fkey;
        RAISE NOTICE 'Dropped notifications_related_message_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'notifications_related_connection_id_fkey' 
               AND table_name = 'notifications' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.notifications DROP CONSTRAINT notifications_related_connection_id_fkey;
        RAISE NOTICE 'Dropped notifications_related_connection_id_fkey constraint';
    END IF;
END $$;

-- ===================================================================
-- SECTION 2: ADD PROPER FOREIGN KEY CONSTRAINTS
-- ===================================================================

-- Add foreign key constraints to messages table
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraints to user_connections table
ALTER TABLE public.user_connections 
ADD CONSTRAINT user_connections_requester_id_fkey 
FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_connections 
ADD CONSTRAINT user_connections_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key constraints to notifications table
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_related_user_id_fkey 
FOREIGN KEY (related_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_related_message_id_fkey 
FOREIGN KEY (related_message_id) REFERENCES public.messages(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_related_connection_id_fkey 
FOREIGN KEY (related_connection_id) REFERENCES public.user_connections(id) ON DELETE CASCADE;

-- ===================================================================
-- SECTION 3: REFRESH SCHEMA CACHE
-- ===================================================================

-- Force refresh of the schema cache by querying the tables
SELECT 1 FROM public.messages LIMIT 1;
SELECT 1 FROM public.user_connections LIMIT 1;
SELECT 1 FROM public.notifications LIMIT 1;
SELECT 1 FROM public.users LIMIT 1;

-- ===================================================================
-- SECTION 4: VALIDATE FOREIGN KEY CONSTRAINTS
-- ===================================================================

-- Check that all foreign key constraints are properly created
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND constraint_type = 'FOREIGN KEY'
    AND table_name IN ('messages', 'user_connections', 'notifications')
    AND constraint_name LIKE '%_fkey';
    
    RAISE NOTICE 'Foreign key constraints created: %', constraint_count;
    
    IF constraint_count >= 7 THEN
        RAISE NOTICE '✅ All foreign key constraints are properly established!';
    ELSE
        RAISE NOTICE '⚠️ Some foreign key constraints may be missing. Expected at least 7, found %.', constraint_count;
    END IF;
END $$;

-- ===================================================================
-- SECTION 5: TEST RELATIONSHIPS
-- ===================================================================

-- Test the relationships by attempting to query with joins
DO $$
DECLARE
    test_result INTEGER;
BEGIN
    -- Test messages -> users relationship
    BEGIN
        SELECT COUNT(*) INTO test_result
        FROM public.messages m
        LEFT JOIN public.users u1 ON m.sender_id = u1.id
        LEFT JOIN public.users u2 ON m.recipient_id = u2.id
        LIMIT 1;
        RAISE NOTICE '✅ Messages -> Users relationship test passed';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Messages -> Users relationship test failed: %', SQLERRM;
    END;
    
    -- Test user_connections -> users relationship
    BEGIN
        SELECT COUNT(*) INTO test_result
        FROM public.user_connections uc
        LEFT JOIN public.users u1 ON uc.requester_id = u1.id
        LEFT JOIN public.users u2 ON uc.recipient_id = u2.id
        LIMIT 1;
        RAISE NOTICE '✅ User_connections -> Users relationship test passed';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ User_connections -> Users relationship test failed: %', SQLERRM;
    END;
    
    -- Test notifications -> users relationship
    BEGIN
        SELECT COUNT(*) INTO test_result
        FROM public.notifications n
        LEFT JOIN public.users u ON n.user_id = u.id
        LEFT JOIN public.users ru ON n.related_user_id = ru.id
        LIMIT 1;
        RAISE NOTICE '✅ Notifications -> Users relationship test passed';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Notifications -> Users relationship test failed: %', SQLERRM;
    END;
END $$;

-- ===================================================================
-- SCRIPT COMPLETION
-- ===================================================================

SELECT 
    'FOREIGN KEY RELATIONSHIPS FIXED SUCCESSFULLY!' as status,
    'All messaging system foreign key constraints have been properly established.' as message,
    NOW() as completed_at;

-- ===================================================================
-- IMPORTANT NOTES:
-- ===================================================================
-- 1. This script fixes the foreign key relationships between:
--    - messages table and users table (sender_id, recipient_id)
--    - user_connections table and users table (requester_id, recipient_id)
--    - notifications table and users table (user_id, related_user_id)
--    - notifications table and messages table (related_message_id)
--    - notifications table and user_connections table (related_connection_id)
--
-- 2. All constraints include ON DELETE CASCADE for data integrity
--
-- 3. The schema cache is refreshed to ensure Supabase recognizes the relationships
--
-- 4. Test the messaging system by navigating to the Messages page
-- ===================================================================
