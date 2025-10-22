-- =========================================
-- COMPLETE TRACER STUDY TABLE SETUP
-- =========================================
-- Run this entire script in your Supabase SQL Editor
-- This will recreate the tracer study table with ALL the exact form field values

-- Drop existing table
DROP TABLE IF EXISTS public.tracer_study_responses CASCADE;

-- Create the new tracer study responses table
CREATE TABLE public.tracer_study_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Personal Information (Step 1)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  sex TEXT NOT NULL,
  civil_status TEXT NOT NULL,
  
  -- Educational Background (Step 2)
  degree TEXT NOT NULL,
  major TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  honors TEXT,
  
  -- Employment Information (Step 3)
  employment_status TEXT NOT NULL,
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  work_location TEXT,
  monthly_salary TEXT,
  employment_type TEXT,
  
  -- Job Search & Career (Step 4)
  first_job_related BOOLEAN,
  job_search_duration TEXT,
  job_search_method TEXT,
  started_job_search TEXT,
  
  -- Skills & Curriculum
  curriculum_helpful BOOLEAN,
  important_skills TEXT,
  additional_training TEXT,
  
  -- Feedback & Suggestions (Step 5)
  program_satisfaction TEXT,
  university_preparation TEXT,
  suggestions TEXT,
  recommend_program BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id) -- One response per user
);

-- Enable RLS
ALTER TABLE public.tracer_study_responses ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view their own tracer study response" ON public.tracer_study_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracer study response" ON public.tracer_study_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracer study response" ON public.tracer_study_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tracer study responses" ON public.tracer_study_responses
  FOR SELECT USING (is_admin(auth.uid()));

-- Create index
CREATE INDEX idx_tracer_study_user ON public.tracer_study_responses(user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_tracer_study_responses_updated_at ON public.tracer_study_responses;
CREATE TRIGGER update_tracer_study_responses_updated_at BEFORE UPDATE ON public.tracer_study_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Tracer study table recreated successfully with all form fields. Constraints removed to accept any values.' as status;
