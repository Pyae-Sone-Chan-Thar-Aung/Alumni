-- Messaging and Connection System Database Schema - SAFE VERSION
-- This script safely handles existing tables and creates the messaging system
-- It checks column existence before making changes

-- First, let's check what tables exist and their structure
-- If tables exist with different structures, we'll handle them appropriately

-- 1. Handle USER_CONNECTIONS table
DO $$
BEGIN
    -- If user_connections table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_connections' AND table_schema = 'public') THEN
        CREATE TABLE public.user_connections (
            id BIGSERIAL PRIMARY KEY,
            requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
            message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(requester_id, recipient_id)
        );
    ELSE
        -- Table exists, check and add missing columns
        -- Check if recipient_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_connections' AND column_name = 'recipient_id' AND table_schema = 'public') THEN
            ALTER TABLE public.user_connections ADD COLUMN recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if requester_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_connections' AND column_name = 'requester_id' AND table_schema = 'public') THEN
            ALTER TABLE public.user_connections ADD COLUMN requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if status column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_connections' AND column_name = 'status' AND table_schema = 'public') THEN
            ALTER TABLE public.user_connections ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        END IF;
        
        -- Check if message column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_connections' AND column_name = 'message' AND table_schema = 'public') THEN
            ALTER TABLE public.user_connections ADD COLUMN message TEXT;
        END IF;
        
        -- Check if created_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_connections' AND column_name = 'created_at' AND table_schema = 'public') THEN
            ALTER TABLE public.user_connections ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Check if updated_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_connections' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            ALTER TABLE public.user_connections ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Add check constraint if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_connections_status_check') THEN
            ALTER TABLE public.user_connections ADD CONSTRAINT user_connections_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked'));
        END IF;
        
        -- Add unique constraint if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_connections_requester_id_recipient_id_key') THEN
            ALTER TABLE public.user_connections ADD CONSTRAINT user_connections_requester_id_recipient_id_key UNIQUE(requester_id, recipient_id);
        END IF;
    END IF;
END $$;

-- 2. Handle MESSAGES table
DO $$
BEGIN
    -- If messages table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        CREATE TABLE public.messages (
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
    ELSE
        -- Table exists, check and add missing columns
        -- Check if sender_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if recipient_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'recipient_id' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if subject column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'subject' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN subject VARCHAR(255);
        END IF;
        
        -- Check if content column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'content' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN content TEXT;
        END IF;
        
        -- Check if is_read column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_read' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Check if read_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'read_at' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        -- Check if created_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'created_at' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Check if updated_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- 3. Handle NOTIFICATIONS table
DO $$
BEGIN
    -- If notifications table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        CREATE TABLE public.notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'message_received', 'message_read')),
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            related_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            related_message_id BIGINT REFERENCES public.messages(id) ON DELETE CASCADE,
            related_connection_id BIGINT REFERENCES public.user_connections(id) ON DELETE CASCADE,
            is_read BOOLEAN DEFAULT FALSE,
            read_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Table exists, check and add missing columns
        -- Check if user_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if type column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN type VARCHAR(50);
        END IF;
        
        -- Check if title column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN title VARCHAR(255);
        END IF;
        
        -- Check if message column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN message TEXT;
        END IF;
        
        -- Check if related_user_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_user_id' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN related_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if related_message_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_message_id' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN related_message_id BIGINT REFERENCES public.messages(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if related_connection_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_connection_id' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN related_connection_id BIGINT REFERENCES public.user_connections(id) ON DELETE CASCADE;
        END IF;
        
        -- Check if is_read column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Check if read_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        -- Check if created_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'created_at' AND table_schema = 'public') THEN
            ALTER TABLE public.notifications ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Add check constraint if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_type_check') THEN
            ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('connection_request', 'connection_accepted', 'message_received', 'message_read'));
        END IF;
    END IF;
END $$;

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
DROP POLICY IF EXISTS "Users can view their own connections" ON public.user_connections;
CREATE POLICY "Users can view their own connections" ON public.user_connections
    FOR SELECT USING (requester_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can create connection requests" ON public.user_connections;
CREATE POLICY "Users can create connection requests" ON public.user_connections
    FOR INSERT WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own connections" ON public.user_connections;
CREATE POLICY "Users can update their own connections" ON public.user_connections
    FOR UPDATE USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Messages policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- 11. Show success message
SELECT 'Messaging and connection system database created successfully!' as status;
