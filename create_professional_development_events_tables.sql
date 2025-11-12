-- ============================================================================
-- Professional Development Events System
-- ============================================================================
-- This script creates tables for managing professional development events
-- where admins can invite alumni, assign speakers, and alumni can apply 
-- to be speakers or keynote speakers.
-- ============================================================================

-- Start transaction
BEGIN;

-- 1. PROFESSIONAL_DEVELOPMENT_EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.professional_development_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Information
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'professional_development' CHECK (event_type IN (
        'professional_development', 
        'workshop', 
        'seminar', 
        'conference', 
        'networking', 
        'webinar',
        'training'
    )),
    
    -- Event Details
    venue TEXT,
    location TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    
    -- Media
    cover_image_url TEXT,
    banner_image_url TEXT,
    
    -- Event Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Event Settings
    requires_registration BOOLEAN DEFAULT TRUE,
    is_free BOOLEAN DEFAULT TRUE,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    
    -- External Links
    registration_url TEXT,
    uic_website_url TEXT,
    facebook_event_url TEXT,
    
    -- Admin Information
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EVENT_PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.professional_development_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Participation Details
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled', 'waitlisted')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmation_date TIMESTAMP WITH TIME ZONE,
    attended_at TIMESTAMP WITH TIME ZONE,
    
    -- Invitation Details
    invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    invitation_type TEXT DEFAULT 'self' CHECK (invitation_type IN ('self', 'admin_invite', 'batchmate_invite')),
    
    -- Additional Information
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one registration per user per event
    UNIQUE(event_id, user_id)
);

-- 3. EVENT_SPEAKERS TABLE
CREATE TABLE IF NOT EXISTS public.event_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.professional_development_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Speaker Role
    role TEXT NOT NULL CHECK (role IN ('speaker', 'keynote_speaker', 'panelist', 'moderator')),
    title TEXT, -- e.g., "Senior Software Engineer at Google"
    bio TEXT,
    
    -- Session Details
    session_title TEXT,
    session_description TEXT,
    session_start_time TIMESTAMP WITH TIME ZONE,
    session_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Invitation Details
    invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Application Details (if applied)
    application_id UUID, -- Reference to speaker_applications table
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one speaker role per user per event
    UNIQUE(event_id, user_id, role)
);

-- 4. SPEAKER_APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.speaker_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.professional_development_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Application Details
    desired_role TEXT NOT NULL CHECK (desired_role IN ('speaker', 'keynote_speaker', 'panelist')),
    proposed_topic TEXT NOT NULL,
    proposed_title TEXT,
    proposed_description TEXT,
    speaking_experience TEXT,
    relevant_qualifications TEXT,
    
    -- Supporting Documents
    resume_url TEXT,
    portfolio_url TEXT,
    sample_presentation_url TEXT,
    
    -- Application Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'withdrawn')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one application per user per event per role
    UNIQUE(event_id, user_id, desired_role)
);

-- 5. EVENT_NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.professional_development_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL means notification to all relevant alumni
    
    -- Notification Details
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'event_created',
        'event_published',
        'invitation_sent',
        'registration_confirmed',
        'speaker_invitation',
        'speaker_application_reviewed',
        'event_reminder',
        'event_update',
        'event_cancelled'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_status ON public.professional_development_events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.professional_development_events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.professional_development_events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.professional_development_events(event_type);

CREATE INDEX IF NOT EXISTS idx_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.event_participants(status);

CREATE INDEX IF NOT EXISTS idx_speakers_event ON public.event_speakers(event_id);
CREATE INDEX IF NOT EXISTS idx_speakers_user ON public.event_speakers(user_id);
CREATE INDEX IF NOT EXISTS idx_speakers_role ON public.event_speakers(role);
CREATE INDEX IF NOT EXISTS idx_speakers_invitation_status ON public.event_speakers(invitation_status);

CREATE INDEX IF NOT EXISTS idx_applications_event ON public.speaker_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.speaker_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.speaker_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_role ON public.speaker_applications(desired_role);

CREATE INDEX IF NOT EXISTS idx_notifications_event ON public.event_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.event_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.event_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.event_notifications(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_events_updated_at ON public.professional_development_events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.professional_development_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_participants_updated_at ON public.event_participants;
CREATE TRIGGER update_participants_updated_at
    BEFORE UPDATE ON public.event_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_speakers_updated_at ON public.event_speakers;
CREATE TRIGGER update_speakers_updated_at
    BEFORE UPDATE ON public.event_speakers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.speaker_applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.speaker_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.professional_development_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaker_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_development_events
-- Authenticated users can view published events
CREATE POLICY "Authenticated users can view published events"
ON public.professional_development_events
FOR SELECT
TO authenticated
USING (status IN ('published', 'ongoing', 'completed'));

-- Admins can do everything
CREATE POLICY "Admins can manage all events"
ON public.professional_development_events
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
        AND users.approval_status = 'approved'
    )
);

-- RLS Policies for event_participants
-- Users can view their own participation
CREATE POLICY "Users can view their own participation"
ON public.event_participants
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can register for events
CREATE POLICY "Users can register for events"
ON public.event_participants
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can view all participants
CREATE POLICY "Admins can view all participants"
ON public.event_participants
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
        AND users.approval_status = 'approved'
    )
);

-- Admins can manage participants
CREATE POLICY "Admins can manage participants"
ON public.event_participants
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
        AND users.approval_status = 'approved'
    )
);

-- RLS Policies for event_speakers
-- Users can view speakers of published events
CREATE POLICY "Users can view speakers of published events"
ON public.event_speakers
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.professional_development_events
        WHERE professional_development_events.id = event_speakers.event_id
        AND professional_development_events.status IN ('published', 'ongoing', 'completed')
    )
    OR user_id = auth.uid()
);

-- Users can view their own speaker invitations
CREATE POLICY "Users can view their own speaker status"
ON public.event_speakers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can manage all speakers
CREATE POLICY "Admins can manage all speakers"
ON public.event_speakers
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
        AND users.approval_status = 'approved'
    )
);

-- RLS Policies for speaker_applications
-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.speaker_applications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create applications
CREATE POLICY "Users can create speaker applications"
ON public.speaker_applications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own pending applications
CREATE POLICY "Users can update their own pending applications"
ON public.speaker_applications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid());

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.speaker_applications
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
        AND users.approval_status = 'approved'
    )
);

-- Admins can manage all applications
CREATE POLICY "Admins can manage all applications"
ON public.speaker_applications
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
        AND users.approval_status = 'approved'
    )
);

-- RLS Policies for event_notifications
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.event_notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
ON public.event_notifications
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
        AND users.approval_status = 'approved'
    )
);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.event_notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_development_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_speakers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaker_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_notifications TO authenticated;

-- Commit transaction
COMMIT;

-- ============================================================================
-- Setup complete!
-- ============================================================================

