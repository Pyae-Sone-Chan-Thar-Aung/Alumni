-- ============================================================================
-- FIX RECURSIVE TRIGGER ERROR
-- ============================================================================
-- This fixes the "stack depth limit exceeded" error caused by the 
-- expire_old_invitations trigger
-- ============================================================================

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_expire_invitations ON public.pending_invitations;

-- Drop the function
DROP FUNCTION IF EXISTS expire_old_invitations();

-- Create a BETTER function that doesn't cause recursion
-- This version only returns without updating the same table
CREATE OR REPLACE FUNCTION check_invitation_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- If the invitation being inserted/updated is already expired, set status
    IF NEW.expires_at < NOW() AND NEW.invitation_status IN ('pending', 'sent') THEN
        NEW.invitation_status = 'expired';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a BEFORE trigger instead (doesn't cause recursion)
CREATE TRIGGER trigger_check_invitation_expiry
    BEFORE INSERT OR UPDATE ON public.pending_invitations
    FOR EACH ROW
    EXECUTE FUNCTION check_invitation_expiry();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger fixed! No more recursion.';
    RAISE NOTICE '📧 Invitation system should work now.';
END $$;
