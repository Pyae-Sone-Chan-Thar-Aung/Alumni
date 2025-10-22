-- ===================================================================
-- FIX REGISTRATION SYSTEM - PENDING_REGISTRATIONS TABLE
-- ===================================================================

-- First, let's check what the current table structure looks like
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_registrations'
ORDER BY ordinal_position;

-- Drop and recreate the pending_registrations table with the correct schema
-- that matches what the registration form is trying to insert
DROP TABLE IF EXISTS public.pending_registrations CASCADE;

CREATE TABLE public.pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    
    -- Academic Information
    student_id TEXT,
    course TEXT NOT NULL,  -- Changed from 'program' to 'course' to match form
    batch_year INTEGER,    -- Changed to INTEGER to match form parsing
    graduation_year INTEGER NOT NULL,  -- Changed to INTEGER to match form parsing
    
    -- Professional Information
    current_job TEXT,
    company TEXT,
    
    -- Contact Information
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Philippines',
    
    -- Profile Image
    profile_image_url TEXT,
    
    -- Status and Processing
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX idx_pending_registrations_submitted_at ON public.pending_registrations(submitted_at);

-- Enable Row Level Security
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to insert pending registrations (for new user registration)
CREATE POLICY "Allow public to insert pending registrations" ON public.pending_registrations
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own pending registration
CREATE POLICY "Users can view own pending registration" ON public.pending_registrations
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Allow admins to view all pending registrations
CREATE POLICY "Admins can view all pending registrations" ON public.pending_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow admins to update pending registrations (for approval/rejection)
CREATE POLICY "Admins can update pending registrations" ON public.pending_registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Allow admins to delete pending registrations
CREATE POLICY "Admins can delete pending registrations" ON public.pending_registrations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER update_pending_registrations_updated_at
    BEFORE UPDATE ON public.pending_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Force Supabase to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the table was created correctly
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_registrations'
ORDER BY ordinal_position;
