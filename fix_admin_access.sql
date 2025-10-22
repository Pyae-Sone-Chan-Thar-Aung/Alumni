-- Fix admin access to view pending user registrations
-- This script addresses the issue where admins cannot see pending registrations

-- First, let's ensure the user_details view has proper RLS
DROP VIEW IF EXISTS public.user_details;

CREATE VIEW public.user_details AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.is_verified,
  u.created_at,
  u.updated_at,
  up.phone,
  up.batch_year,
  up.course,
  up.current_job,
  up.company,
  up.address,
  up.bio,
  up.profile_image_url
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id;

-- Enable RLS on the view
ALTER VIEW public.user_details SET (security_barrier=true, check_option=CASCADED);

-- Create policies for the user_details view
CREATE POLICY "Users can view their own details" ON public.user_details
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all user details" ON public.user_details
  FOR SELECT USING (is_admin(auth.uid()));

-- Also add a policy for admins to view verified and unverified users specifically
CREATE POLICY "Admins can view pending users" ON public.users
  FOR SELECT USING (is_admin(auth.uid()) AND is_verified = false);

-- Update the is_admin function to be more robust
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = user_uuid;
    RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the admin user exists and has correct permissions
-- Replace 'your-admin-uuid-here' with the actual UUID from Supabase auth.users
-- You can find this in the Supabase dashboard under Authentication > Users

-- Example insert (uncomment and update with actual admin UUID):
-- INSERT INTO public.users (id, email, first_name, last_name, role, is_verified)
-- VALUES (
--   'your-admin-uuid-here', -- Replace with actual auth.users UUID
--   'paung_230000001724@uic.edu.ph',
--   'Paung',
--   'Admin',
--   'admin',
--   true
-- ) ON CONFLICT (id) DO UPDATE SET
--   role = 'admin',
--   is_verified = true;

-- Grant necessary permissions to authenticated users for the functions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_batch(UUID) TO authenticated;

-- Grant SELECT permission on user_details view to authenticated users
GRANT SELECT ON public.user_details TO authenticated;

-- Test query to verify admin can see pending users
-- SELECT * FROM public.user_details WHERE is_verified = false;
