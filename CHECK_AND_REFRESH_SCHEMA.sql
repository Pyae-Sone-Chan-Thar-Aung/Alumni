-- ===================================================================
-- CHECK CURRENT SCHEMA AND FORCE REFRESH
-- ===================================================================

-- 1. Check what columns actually exist in pending_registrations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_registrations'
ORDER BY ordinal_position;

-- 2. Force Supabase to reload the schema cache
-- This notifies PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- 3. Alternative: Check if the table even exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pending_registrations'
) as table_exists;

-- 4. If needed, recreate the entire pending_registrations table
-- UNCOMMENT ONLY IF THE TABLE DOESN'T EXIST OR IS COMPLETELY BROKEN
/*
DROP TABLE IF EXISTS public.pending_registrations CASCADE;

CREATE TABLE public.pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    student_id TEXT,
    phone TEXT,
    program TEXT,
    course TEXT,
    batch_year TEXT,
    graduation_year TEXT,
    current_job TEXT,
    company TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Philippines',
    profile_image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can insert their own pending registration"
ON public.pending_registrations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own pending registration"
ON public.pending_registrations
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage all pending registrations"
ON public.pending_registrations
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Force schema reload again
NOTIFY pgrst, 'reload schema';
*/
