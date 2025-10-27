-- ============================================================================
-- SIMPLE INVITATION SYSTEM SETUP
-- ============================================================================
-- This is a simplified version without complex triggers or RLS issues
-- Run this if you're having problems with the other scripts
-- ============================================================================

-- Drop table if exists (clean start)
DROP TABLE IF EXISTS public.pending_invitations CASCADE;

-- Create the table
CREATE TABLE public.pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    
    -- Role Information
    role TEXT DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni')),
    
    -- Academic Information (for alumni)
    program TEXT,
    batch_year TEXT,
    graduation_year TEXT,
    
    -- Professional Information (optional)
    current_job TEXT,
    company TEXT,
    
    -- Contact Information (optional)
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Philippines',
    
    -- Invitation Status
    invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'sent', 'accepted', 'expired')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Tracking
    invitation_token TEXT UNIQUE,
    invited_by UUID REFERENCES public.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_pending_invitations_email ON public.pending_invitations(email);
CREATE INDEX idx_pending_invitations_status ON public.pending_invitations(invitation_status);

-- Enable RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies (works for all authenticated users)
CREATE POLICY "Allow authenticated to manage invitations"
ON public.pending_invitations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public to view (for registration page)
CREATE POLICY "Allow public to view invitations"
ON public.pending_invitations
FOR SELECT
TO anon
USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Invitation system setup complete!';
    RAISE NOTICE '📧 You can now send invitations without errors.';
    RAISE NOTICE '🚀 Try the Add User button again.';
END $$;
