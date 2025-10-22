-- Messaging and Connection System Database Schema
-- This script creates the necessary tables for alumni messaging and connections

-- 1. USER_CONNECTIONS TABLE - Track connection requests and status
CREATE TABLE IF NOT EXISTS public.user_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    message TEXT, -- Optional message with connection request
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, recipient_id) -- Prevent duplicate connections
);

-- 2. MESSAGES TABLE - Store all messages between alumni
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. NOTIFICATIONS TABLE - Track all notifications for users
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'message_received', 'message_read')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    related_message_id BIGINT REFERENCES public.messages(id) ON DELETE CASCADE,
    related_connection_id UUID REFERENCES public.user_connections(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON public.user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_recipient ON public.user_connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON public.user_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_connections_created_at ON public.user_connections(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 5. Create functions for automatic notifications
CREATE OR REPLACE FUNCTION create_connection_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for recipient when connection request is made
    IF NEW.status = 'pending' THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            related_user_id,
            related_connection_id
        ) VALUES (
            NEW.recipient_id,
            'connection_request',
            'New Connection Request',
            (SELECT first_name || ' ' || last_name FROM public.users WHERE id = NEW.requester_id) || ' wants to connect with you',
            NEW.requester_id,
            NEW.id
        );
    END IF;
    
    -- Create notification for requester when connection is accepted
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            related_user_id,
            related_connection_id
        ) VALUES (
            NEW.requester_id,
            'connection_accepted',
            'Connection Accepted',
            (SELECT first_name || ' ' || last_name FROM public.users WHERE id = NEW.recipient_id) || ' accepted your connection request',
            NEW.recipient_id,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for connection notifications
DROP TRIGGER IF EXISTS trigger_connection_notifications ON public.user_connections;
CREATE TRIGGER trigger_connection_notifications
    AFTER INSERT OR UPDATE ON public.user_connections
    FOR EACH ROW
    EXECUTE FUNCTION create_connection_notification();

-- 7. Create function for message notifications
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for recipient when message is sent
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        related_user_id,
        related_message_id
    ) VALUES (
        NEW.recipient_id,
        'message_received',
        'New Message',
        (SELECT first_name || ' ' || last_name FROM public.users WHERE id = NEW.sender_id) || ' sent you a message',
        NEW.sender_id,
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for message notifications
DROP TRIGGER IF EXISTS trigger_message_notifications ON public.messages;
CREATE TRIGGER trigger_message_notifications
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_notification();

-- 9. Create function to mark message as read and create read notification
CREATE OR REPLACE FUNCTION mark_message_read(message_id BIGINT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    message_record RECORD;
BEGIN
    -- Get the message
    SELECT * INTO message_record FROM public.messages WHERE id = message_id;
    
    -- Check if user is the recipient
    IF message_record.recipient_id != user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Mark message as read
    UPDATE public.messages 
    SET is_read = TRUE, read_at = NOW()
    WHERE id = message_id;
    
    -- Create read notification for sender
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        related_user_id,
        related_message_id
    ) VALUES (
        message_record.sender_id,
        'message_read',
        'Message Read',
        (SELECT first_name || ' ' || last_name FROM public.users WHERE id = user_id) || ' read your message',
        user_id,
        message_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Add RLS (Row Level Security) policies
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User connections policies
CREATE POLICY "Users can view their own connections" ON public.user_connections
    FOR SELECT USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create connection requests" ON public.user_connections
    FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own connections" ON public.user_connections
    FOR UPDATE USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- 11. Show success message
SELECT 'Messaging and connection system database created successfully!' as status;
