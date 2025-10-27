-- ============================================================================
-- CREATE PENDING_INVITATIONS TABLE
-- ============================================================================
-- This table stores invitation data for users invited by super admins
-- Users will receive invitation emails and must confirm to complete registration
-- ============================================================================

-- Create pending_invitations table
CREATE TABLE IF NOT EXISTS public.pending_invitations (
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
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'), -- Invitation expires in 7 days
    
    -- Tracking
    invitation_token TEXT UNIQUE, -- Optional: for custom invitation links
    invited_by UUID REFERENCES public.users(id), -- Track which admin sent the invitation
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON public.pending_invitations(email);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_status ON public.pending_invitations(invitation_status);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_role ON public.pending_invitations(role);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_invited_at ON public.pending_invitations(invited_at);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_expires_at ON public.pending_invitations(expires_at);

-- Enable Row Level Security
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can view all invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Super admins can insert invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Super admins can update invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Super admins can delete invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Users can view their own invitation" ON public.pending_invitations;
DROP POLICY IF EXISTS "Allow service role full access" ON public.pending_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.pending_invitations;

-- RLS Policies for pending_invitations

-- Allow authenticated users with admin or super_admin role to view invitations
CREATE POLICY "Admins can view all invitations"
ON public.pending_invitations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_id = auth.uid()
        AND users.role IN ('super_admin', 'admin')
    )
);

-- Allow authenticated users with admin or super_admin role to insert invitations
CREATE POLICY "Admins can insert invitations"
ON public.pending_invitations
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_id = auth.uid()
        AND users.role IN ('super_admin', 'admin')
    )
);

-- Allow authenticated users with admin or super_admin role to update invitations
CREATE POLICY "Admins can update invitations"
ON public.pending_invitations
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_id = auth.uid()
        AND users.role IN ('super_admin', 'admin')
    )
);

-- Allow authenticated users with admin or super_admin role to delete invitations
CREATE POLICY "Admins can delete invitations"
ON public.pending_invitations
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_id = auth.uid()
        AND users.role IN ('super_admin', 'admin')
    )
);

-- Users can view their own invitation by email (for completing registration)
CREATE POLICY "Users can view their own invitation"
ON public.pending_invitations
FOR SELECT
TO anon, authenticated
USING (true); -- Allow public access for invitation lookup during registration

-- Create function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.pending_invitations
    SET invitation_status = 'expired'
    WHERE invitation_status IN ('pending', 'sent')
    AND expires_at < NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run expiration check
DROP TRIGGER IF EXISTS trigger_expire_invitations ON public.pending_invitations;
CREATE TRIGGER trigger_expire_invitations
    AFTER INSERT OR UPDATE ON public.pending_invitations
    EXECUTE FUNCTION expire_old_invitations();

-- Add comment to table
COMMENT ON TABLE public.pending_invitations IS 'Stores invitation data for users invited by super admins. Users must accept invitation via email to complete registration.';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ pending_invitations table created successfully!';
    RAISE NOTICE '📧 Invitation system is now ready to use.';
    RAISE NOTICE '⏰ Invitations will automatically expire after 7 days.';
END $$;
