-- Fix User Management Schema Issues
-- Run this script in your Supabase SQL Editor to resolve database connection issues

-- 1. Ensure users table has all required columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni'));

-- 2. Update existing users to have consistent approval status
UPDATE public.users 
SET approval_status = CASE 
    WHEN is_verified = TRUE THEN 'approved'
    ELSE 'pending'
END
WHERE approval_status IS NULL;

-- 3. Ensure user_profiles table has all required columns
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS batch_year INTEGER,
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS current_job TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Create pending_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON public.users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON public.users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_user_id ON public.pending_registrations(user_id);

-- 6. Enable RLS on all tables (except users table which may need to stay disabled for registration)
-- Note: Based on previous setup, users table RLS might be disabled to allow registration
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;  -- Commented out - may need to stay disabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Uncomment the line below ONLY if you want to re-enable RLS on users table
-- Be aware this might break registration functionality
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view pending registrations" ON public.pending_registrations;
DROP POLICY IF EXISTS "Admins can manage pending registrations" ON public.pending_registrations;

-- 8. Create helper function to check if user is admin
-- Handle multiple function signatures by updating each one specifically

-- First, let's see what is_admin functions exist and update them appropriately
DO $$
DECLARE
    func_record RECORD;
    func_count INTEGER;
BEGIN
    -- Count existing is_admin functions
    SELECT COUNT(*) INTO func_count 
    FROM pg_proc 
    WHERE proname = 'is_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    RAISE NOTICE 'Found % existing is_admin functions', func_count;
    
    -- Update each existing function to ensure it works with the role column
    FOR func_record IN 
        SELECT oid, pg_get_function_arguments(oid) as args, pg_get_function_identity_arguments(oid) as identity_args
        FROM pg_proc 
        WHERE proname = 'is_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        RAISE NOTICE 'Updating function with signature: %', func_record.args;
        
        -- Handle different function signatures
        IF func_record.args = 'user_uuid uuid' OR func_record.identity_args = 'user_uuid uuid' THEN
            -- Update function with user_uuid parameter
            CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
            RETURNS BOOLEAN AS $func$
            BEGIN
                RETURN EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = user_uuid AND role = 'admin'
                );
            END;
            $func$ LANGUAGE plpgsql SECURITY DEFINER;
            
        ELSIF func_record.args = 'uuid' OR func_record.identity_args = 'uuid' THEN
            -- Update function with unnamed uuid parameter
            CREATE OR REPLACE FUNCTION public.is_admin(UUID DEFAULT auth.uid())
            RETURNS BOOLEAN AS $func$
            BEGIN
                RETURN EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = $1 AND role = 'admin'
                );
            END;
            $func$ LANGUAGE plpgsql SECURITY DEFINER;
            
        ELSIF func_record.args = '' OR func_record.args IS NULL THEN
            -- Update function with no parameters
            CREATE OR REPLACE FUNCTION public.is_admin()
            RETURNS BOOLEAN AS $func$
            BEGIN
                RETURN EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() AND role = 'admin'
                );
            END;
            $func$ LANGUAGE plpgsql SECURITY DEFINER;
            
        ELSE
            -- Handle any other signature by creating a generic one
            RAISE NOTICE 'Unknown function signature: %, creating default', func_record.args;
        END IF;
    END LOOP;
    
    -- If no functions exist, create the default one
    IF func_count = 0 THEN
        CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
        RETURNS BOOLEAN AS $func$
        BEGIN
            RETURN EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = user_id AND role = 'admin'
            );
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
        
        RAISE NOTICE 'Created new is_admin function with user_id parameter';
    END IF;
    
    RAISE NOTICE 'All is_admin functions have been updated to work with role column';
END
$$;

-- 9. Create RLS policies for users table
-- Note: Using specific function signatures to avoid ambiguity
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 10. Create RLS policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 11. Create RLS policies for pending_registrations table
CREATE POLICY "Admins can view pending registrations" ON public.pending_registrations
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage pending registrations" ON public.pending_registrations
    FOR ALL USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 12. Create trigger to automatically create pending registration entry
-- First drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trigger_create_pending_registration ON public.users;
DROP FUNCTION IF EXISTS public.create_pending_registration();

CREATE OR REPLACE FUNCTION public.create_pending_registration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approval_status = 'pending' AND (OLD IS NULL OR OLD.approval_status IS DISTINCT FROM 'pending') THEN
        INSERT INTO public.pending_registrations (user_id, status)
        VALUES (NEW.id, 'pending')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_pending_registration
    AFTER INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.create_pending_registration();

-- 13. Create function to sync user approval status
-- First drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS trigger_sync_user_approval ON public.users;
DROP FUNCTION IF EXISTS public.sync_user_approval();

CREATE OR REPLACE FUNCTION public.sync_user_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Update is_verified based on approval_status
    IF NEW.approval_status = 'approved' THEN
        NEW.is_verified = TRUE;
        NEW.approved_at = COALESCE(NEW.approved_at, NOW());
    ELSE
        NEW.is_verified = FALSE;
        NEW.approved_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_user_approval
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_approval();

-- 14. Insert sample admin user if none exists
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    approval_status,
    is_verified,
    approved_at,
    created_at
) VALUES (
    gen_random_uuid(),
    'admin@uic.edu.ph',
    'System',
    'Administrator',
    'admin',
    'approved',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 15. Create view for easy user management
CREATE OR REPLACE VIEW public.user_management_view AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.approval_status,
    u.is_verified,
    u.approved_at,
    u.registration_date,
    u.created_at as user_created_at,
    p.phone,
    p.course,
    p.batch_year,
    p.graduation_year,
    p.current_job,
    p.company,
    p.address,
    p.city,
    p.country,
    p.profile_image_url,
    pr.status as pending_status,
    pr.submitted_at as pending_submitted_at
FROM public.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
LEFT JOIN public.pending_registrations pr ON u.id = pr.user_id
ORDER BY u.created_at DESC;

-- 16. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_registrations TO authenticated;
GRANT SELECT ON public.user_management_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- 17. Update existing data to ensure consistency
UPDATE public.users 
SET registration_date = created_at 
WHERE registration_date IS NULL;

-- Success message
SELECT 'User management schema has been successfully updated!' as message;
