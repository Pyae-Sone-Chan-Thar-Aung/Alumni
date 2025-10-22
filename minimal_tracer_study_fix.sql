-- =========================================
-- MINIMAL TRACER STUDY TABLE FIX
-- =========================================
-- Run this entire script in your Supabase SQL Editor

-- Drop existing table and policies
DROP TABLE IF EXISTS public.tracer_study_responses CASCADE;

-- Create the tracer study responses table with minimal constraints
CREATE TABLE public.tracer_study_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal Information
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  sex TEXT,
  civil_status TEXT,
  
  -- Educational Background
  degree TEXT,
  major TEXT,
  graduation_year INTEGER,
  honors TEXT,
  
  -- Employment Information
  employment_status TEXT,
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  work_location TEXT,
  monthly_salary TEXT,
  employment_type TEXT,
  
  -- Job Search & Career
  first_job_related BOOLEAN,
  job_search_duration TEXT,
  job_search_method TEXT,
  started_job_search TEXT,
  
  -- Skills & Curriculum
  curriculum_helpful BOOLEAN,
  important_skills TEXT,
  additional_training TEXT,
  
  -- Feedback & Suggestions
  program_satisfaction TEXT,
  university_preparation TEXT,
  suggestions TEXT,
  recommend_program BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.tracer_study_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "tracer_study_select_own" ON public.tracer_study_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tracer_study_insert_own" ON public.tracer_study_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tracer_study_update_own" ON public.tracer_study_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tracer_study_admin_all" ON public.tracer_study_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX idx_tracer_study_responses_user_id ON public.tracer_study_responses(user_id);

-- Create update trigger if the function exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_tracer_study_responses_updated_at ON public.tracer_study_responses;
        CREATE TRIGGER update_tracer_study_responses_updated_at 
            BEFORE UPDATE ON public.tracer_study_responses
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL ON public.tracer_study_responses TO authenticated;

-- Final check
SELECT 'Tracer study table created successfully. All fields are nullable except user_id.' as status;
