-- =========================================
-- Fix Check Constraints to Match Form Values
-- =========================================
-- Run this in your Supabase SQL Editor to fix the constraint mismatches

-- Fix employment_type constraint
ALTER TABLE public.tracer_study_responses 
DROP CONSTRAINT IF EXISTS tracer_study_responses_employment_type_check;

ALTER TABLE public.tracer_study_responses 
ADD CONSTRAINT tracer_study_responses_employment_type_check 
CHECK (employment_type IN ('Regular/Permanent', 'Contractual', 'Temporary', 'Project-based', 'Probationary'));

-- Fix employment_status constraint to match form values
ALTER TABLE public.tracer_study_responses 
DROP CONSTRAINT IF EXISTS tracer_study_responses_employment_status_check;

ALTER TABLE public.tracer_study_responses 
ADD CONSTRAINT tracer_study_responses_employment_status_check 
CHECK (employment_status IN ('Employed (Full-time)', 'Employed (Part-time)', 'Self-employed/Freelancer', 'Unemployed', 'Student (Graduate Studies)', 'Not in Labor Force'));

-- Fix job_search_duration constraint to include all form values
ALTER TABLE public.tracer_study_responses 
DROP CONSTRAINT IF EXISTS tracer_study_responses_job_search_duration_check;

ALTER TABLE public.tracer_study_responses 
ADD CONSTRAINT tracer_study_responses_job_search_duration_check 
CHECK (job_search_duration IN ('Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than 1 year', 'Still looking'));

-- Fix job_search_method constraint to include all form values
ALTER TABLE public.tracer_study_responses 
DROP CONSTRAINT IF EXISTS tracer_study_responses_job_search_method_check;

ALTER TABLE public.tracer_study_responses 
ADD CONSTRAINT tracer_study_responses_job_search_method_check 
CHECK (job_search_method IN ('Online job portals', 'Company website', 'Walk-in application', 'Referral from friends/family', 'Career fair', 'School placement office', 'Social media', 'Professional network', 'Other'));

-- Fix started_job_search constraint
ALTER TABLE public.tracer_study_responses 
DROP CONSTRAINT IF EXISTS tracer_study_responses_started_job_search_check;

ALTER TABLE public.tracer_study_responses 
ADD CONSTRAINT tracer_study_responses_started_job_search_check 
CHECK (started_job_search IN ('Before graduation', 'After graduation', 'Did not actively search'));

-- Fix university_preparation constraint (remove "Very Good" which isn't in the form)
ALTER TABLE public.tracer_study_responses 
DROP CONSTRAINT IF EXISTS tracer_study_responses_university_preparation_check;

ALTER TABLE public.tracer_study_responses 
ADD CONSTRAINT tracer_study_responses_university_preparation_check 
CHECK (university_preparation IN ('Excellent', 'Good', 'Fair', 'Poor'));

-- Success message
SELECT 'Database constraints fixed! Form should now work without constraint violations.' as status;
