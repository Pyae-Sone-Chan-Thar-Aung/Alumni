-- Fix RLS policies for messaging system triggers
-- This script fixes the Row Level Security issues that prevent triggers from working

-- 1. Temporarily disable RLS on notifications table to allow triggers to work
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 2. Re-enable RLS with proper policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- 4. Create new policies that allow triggers to work
-- Allow users to view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

-- Allow users to update their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Allow system to insert notifications (for triggers)
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- 5. Also fix user_connections policies to ensure they work properly
ALTER TABLE public.user_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own connections" ON public.user_connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.user_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.user_connections;

CREATE POLICY "Users can view their own connections" ON public.user_connections
    FOR SELECT USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create connection requests" ON public.user_connections
    FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own connections" ON public.user_connections
    FOR UPDATE USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- 6. Fix messages policies
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- 7. Show success message
SELECT 'RLS policies fixed successfully! Triggers should now work properly.' as status;
