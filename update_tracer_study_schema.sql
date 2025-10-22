-- =========================================
-- Update Tracer Study Schema to Match New Form
-- =========================================
-- Run this in your Supabase SQL Editor to update the schema

-- Drop the existing table and recreate with correct fields
DROP TABLE IF EXISTS public.tracer_study_responses CASCADE;

-- Create the new tracer study responses table with fields matching the form
CREATE TABLE public.tracer_study_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Personal Information (Step 1)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('Male', 'Female')),
  civil_status TEXT NOT NULL CHECK (civil_status IN ('Single', 'Married', 'Separated', 'Divorced', 'Widowed')),
  
  -- Educational Background (Step 2)
  degree TEXT NOT NULL,
  major TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  honors TEXT,
  
  -- Employment Information (Step 3)
  employment_status TEXT NOT NULL CHECK (employment_status IN ('Employed', 'Self-employed', 'Unemployed', 'Student (Graduate Studies)', 'Not in Labor Force')),
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  work_location TEXT,
  monthly_salary TEXT CHECK (monthly_salary IN ('Below ₱15,000', '₱15,000 - ₱25,000', '₱25,001 - ₱35,000', '₱35,001 - ₱50,000', '₱50,001 - ₱75,000', '₱75,001 - ₱100,000', 'Above ₱100,000')),
  employment_type TEXT CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship')),
  
  -- Job Search & Career (Step 4)
  first_job_related BOOLEAN,
  job_search_duration TEXT CHECK (job_search_duration IN ('Less than 1 month', '1-3 months', '4-6 months', '7-12 months', 'More than 1 year')),
  job_search_method TEXT CHECK (job_search_method IN ('Online job portals', 'Networking/Referrals', 'Direct application', 'Campus recruitment', 'Social media', 'Government employment agency', 'Other')),
  started_job_search TEXT CHECK (started_job_search IN ('Before graduation', 'After graduation', 'During final semester', 'Not applicable')),
  
  -- Skills & Curriculum
  curriculum_helpful BOOLEAN,
  important_skills TEXT,
  additional_training TEXT,
  
  -- Feedback & Suggestions (Step 5)
  program_satisfaction TEXT CHECK (program_satisfaction IN ('Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied')),
  university_preparation TEXT CHECK (university_preparation IN ('Excellent', 'Very Good', 'Good', 'Fair', 'Poor')),
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
CREATE TRIGGER update_tracer_study_responses_updated_at BEFORE UPDATE ON public.tracer_study_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Tracer study schema updated successfully! All form fields now match the database.' as status;
