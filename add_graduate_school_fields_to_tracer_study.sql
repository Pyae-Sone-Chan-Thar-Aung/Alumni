-- =====================================================================
-- ADD GRADUATE SCHOOL FIELDS TO TRACER_STUDY_RESPONSES TABLE
-- =====================================================================
-- Run this SQL in your Supabase SQL Editor to add graduate school tracking
-- This enables the Graduate School tab in Admin Dashboard and Analytics

-- Add pursuing_further_education column (boolean)
ALTER TABLE public.tracer_study_responses 
ADD COLUMN IF NOT EXISTS pursuing_further_education BOOLEAN DEFAULT FALSE;

-- Add further_education_type column (text)
ALTER TABLE public.tracer_study_responses 
ADD COLUMN IF NOT EXISTS further_education_type TEXT;

-- Add further_education_institution column (text) - bonus field
ALTER TABLE public.tracer_study_responses 
ADD COLUMN IF NOT EXISTS further_education_institution TEXT;

-- Add further_education_field column (text) - bonus field
ALTER TABLE public.tracer_study_responses 
ADD COLUMN IF NOT EXISTS further_education_field TEXT;

-- Add further_education_reason column (text) - bonus field
ALTER TABLE public.tracer_study_responses 
ADD COLUMN IF NOT EXISTS further_education_reason TEXT;

-- Add constraint for further_education_type
ALTER TABLE public.tracer_study_responses
DROP CONSTRAINT IF EXISTS check_further_education_type;

ALTER TABLE public.tracer_study_responses
ADD CONSTRAINT check_further_education_type 
CHECK (further_education_type IS NULL OR further_education_type IN (
    'Masters Degree', 
    'Doctorate', 
    'Professional Certification', 
    'Short Course', 
    'Online Course', 
    'Other'
));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tracer_pursuing_further_education 
ON public.tracer_study_responses(pursuing_further_education);

CREATE INDEX IF NOT EXISTS idx_tracer_further_education_type 
ON public.tracer_study_responses(further_education_type);

-- Add comments to document the columns
COMMENT ON COLUMN public.tracer_study_responses.pursuing_further_education 
IS 'Whether the alumni is currently pursuing further education (graduate studies)';

COMMENT ON COLUMN public.tracer_study_responses.further_education_type 
IS 'Type of further education: Masters Degree, Doctorate, Professional Certification, etc.';

COMMENT ON COLUMN public.tracer_study_responses.further_education_institution 
IS 'Name of the institution where pursuing further education';

COMMENT ON COLUMN public.tracer_study_responses.further_education_field 
IS 'Field of study for further education';

COMMENT ON COLUMN public.tracer_study_responses.further_education_reason 
IS 'Reason for pursuing further education';

-- Force Supabase to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the columns were added successfully
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'tracer_study_responses'
    AND column_name IN (
        'pursuing_further_education', 
        'further_education_type', 
        'further_education_institution',
        'further_education_field',
        'further_education_reason'
    )
ORDER BY ordinal_position;

-- Success message
SELECT 'Graduate school fields added successfully! ✅' AS status;
