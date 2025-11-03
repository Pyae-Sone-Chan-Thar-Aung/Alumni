-- ===================================================================
-- ADD GRADUATE STUDIES FIELDS TO PENDING_REGISTRATIONS TABLE
-- ===================================================================
-- This migration adds employment_status, degree_program, and university
-- columns to support the graduate studies registration option

-- Add employment_status column
ALTER TABLE public.pending_registrations 
ADD COLUMN IF NOT EXISTS employment_status TEXT;

-- Add degree_program column for graduate studies
ALTER TABLE public.pending_registrations 
ADD COLUMN IF NOT EXISTS degree_program TEXT;

-- Add university column for graduate studies
ALTER TABLE public.pending_registrations 
ADD COLUMN IF NOT EXISTS university TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pending_registrations_employment_status 
ON public.pending_registrations(employment_status);

-- Add comment to document the columns
COMMENT ON COLUMN public.pending_registrations.employment_status IS 'Employment status of the registrant (e.g., Employed, Unemployed, Pursuing Graduate Studies)';
COMMENT ON COLUMN public.pending_registrations.degree_program IS 'Degree program if pursuing graduate studies (Master''s/PhD)';
COMMENT ON COLUMN public.pending_registrations.university IS 'University/College name if pursuing graduate studies';

-- Force Supabase to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_registrations'
    AND column_name IN ('employment_status', 'degree_program', 'university')
ORDER BY ordinal_position;
