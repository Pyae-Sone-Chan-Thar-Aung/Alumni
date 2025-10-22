-- =========================================
-- UIC Alumni Portal System - Complete Database Setup
-- =========================================
-- Run this entire script in your Supabase SQL Editor

-- 1) Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) Create Tables (in dependency order)

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'alumni' CHECK (role IN ('alumni', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  phone TEXT,
  batch_year INTEGER,
  course TEXT,
  current_job TEXT,
  company TEXT,
  address TEXT,
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- News table
CREATE TABLE public.news (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id),
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job opportunities table
CREATE TABLE public.job_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  salary_range TEXT,
  posted_by UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch groups table
CREATE TABLE public.batch_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  batch_year INTEGER NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch messages table
CREATE TABLE public.batch_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_group_id UUID REFERENCES public.batch_groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Direct messages table
CREATE TABLE public.direct_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id),
  receiver_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot messages table
CREATE TABLE public.chatbot_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRACER STUDY RESPONSES TABLE
CREATE TABLE public.tracer_study_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- General Information
  full_name TEXT NOT NULL,
  davao_address TEXT NOT NULL,
  place_of_origin TEXT NOT NULL,
  landline_number TEXT,
  mobile_number TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('Female', 'Male')),
  civil_status TEXT NOT NULL CHECK (civil_status IN ('Single', 'Married', 'Separated', 'Widow or Widower')),
  
  -- Educational Background
  highest_degree TEXT NOT NULL,
  major_specialization TEXT NOT NULL,
  year_graduated INTEGER NOT NULL,
  honors_awards TEXT,
  useful_skills TEXT,
  
  -- Employment Data
  current_employer TEXT NOT NULL,
  industry TEXT NOT NULL,
  employment_status TEXT NOT NULL CHECK (employment_status IN ('Regular', 'Temporary', 'Contractual', 'Casual')),
  job_position TEXT NOT NULL,
  income_level TEXT NOT NULL CHECK (income_level IN ('10,000 & below', '10,001 - 15,000', '15,001 - 20,000', '20,001 - 25,000', '25,001 - 30,000', '30,001 - 35,000', '35,001 & above')),
  first_job_related BOOLEAN NOT NULL,
  how_got_first_job TEXT NOT NULL,
  when_started_seeking TEXT NOT NULL,
  time_to_first_job TEXT NOT NULL,
  curriculum_relevant BOOLEAN NOT NULL,
  
  -- Competency Rankings (1-7 scale)
  communication_skills_rank INTEGER CHECK (communication_skills_rank BETWEEN 1 AND 7),
  human_relation_skills_rank INTEGER CHECK (human_relation_skills_rank BETWEEN 1 AND 7),
  entrepreneurial_skills_rank INTEGER CHECK (entrepreneurial_skills_rank BETWEEN 1 AND 7),
  critical_thinking_skills_rank INTEGER CHECK (critical_thinking_skills_rank BETWEEN 1 AND 7),
  problem_solving_skills_rank INTEGER CHECK (problem_solving_skills_rank BETWEEN 1 AND 7),
  programming_skills_rank INTEGER CHECK (programming_skills_rank BETWEEN 1 AND 7),
  other_it_skills_rank INTEGER CHECK (other_it_skills_rank BETWEEN 1 AND 7),
  
  -- Open-ended responses
  uic_characteristics TEXT,
  training_influence TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id) -- One response per user
);

-- 3) Helper Functions
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_batch(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT batch_year FROM public.user_profiles WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM public.users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) Views
CREATE VIEW public.user_details AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.is_verified,
  u.created_at,
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

-- 5) Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracer_study_responses ENABLE ROW LEVEL SECURITY;

-- 6) RLS Policies

-- Users policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (is_admin(auth.uid()));

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Same batch can view profiles" ON public.user_profiles
  FOR SELECT USING (
    get_user_batch(auth.uid()) = batch_year AND 
    get_user_batch(auth.uid()) IS NOT NULL
  );

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (is_admin(auth.uid()));

-- News policies
CREATE POLICY "Anyone can view published news" ON public.news
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all news" ON public.news
  FOR ALL USING (is_admin(auth.uid()));

-- Job opportunities policies
CREATE POLICY "Anyone can view active job opportunities" ON public.job_opportunities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all job opportunities" ON public.job_opportunities
  FOR ALL USING (is_admin(auth.uid()));

-- Batch groups policies
CREATE POLICY "Same batch can view groups" ON public.batch_groups
  FOR SELECT USING (
    batch_year = get_user_batch(auth.uid()) AND 
    get_user_batch(auth.uid()) IS NOT NULL
  );

CREATE POLICY "Admins can manage all batch groups" ON public.batch_groups
  FOR ALL USING (is_admin(auth.uid()));

-- Batch messages policies
CREATE POLICY "Same batch can view messages" ON public.batch_messages
  FOR SELECT USING (
    batch_group_id IN (
      SELECT id FROM public.batch_groups 
      WHERE batch_year = get_user_batch(auth.uid())
    )
  );

CREATE POLICY "Same batch can send messages" ON public.batch_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    batch_group_id IN (
      SELECT id FROM public.batch_groups 
      WHERE batch_year = get_user_batch(auth.uid())
    )
  );

-- Direct messages policies
CREATE POLICY "Users can view their own messages" ON public.direct_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.direct_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status" ON public.direct_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Chatbot messages policies
CREATE POLICY "Users can manage their own chatbot messages" ON public.chatbot_messages
  FOR ALL USING (auth.uid() = user_id);

-- Tracer study responses policies
CREATE POLICY "Users can view their own tracer study response" ON public.tracer_study_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracer study response" ON public.tracer_study_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracer study response" ON public.tracer_study_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tracer study responses" ON public.tracer_study_responses
  FOR SELECT USING (is_admin(auth.uid()));

-- 7) Create Indexes for Performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_user_profiles_batch_year ON public.user_profiles(batch_year);
CREATE INDEX idx_news_published ON public.news(is_published);
CREATE INDEX idx_job_opportunities_active ON public.job_opportunities(is_active);
CREATE INDEX idx_batch_groups_year ON public.batch_groups(batch_year);
CREATE INDEX idx_batch_messages_group ON public.batch_messages(batch_group_id);
CREATE INDEX idx_direct_messages_participants ON public.direct_messages(sender_id, receiver_id);
CREATE INDEX idx_tracer_study_user ON public.tracer_study_responses(user_id);

-- 8) Update Functions for Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_opportunities_updated_at BEFORE UPDATE ON public.job_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_groups_updated_at BEFORE UPDATE ON public.batch_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracer_study_responses_updated_at BEFORE UPDATE ON public.tracer_study_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9) Insert some sample data (optional - for testing)
INSERT INTO public.news (title, content, is_published) VALUES 
('Welcome to UIC Alumni Portal', 'Welcome to the University of the Immaculate Conception Alumni Portal! This is your gateway to stay connected with your alma mater and fellow alumni.', true),
('Alumni Reunion 2024', 'Join us for the annual alumni reunion on December 15, 2024. More details coming soon!', true);

INSERT INTO public.job_opportunities (title, company, description, location, salary_range, is_active) VALUES 
('Software Developer', 'Tech Solutions Inc.', 'Looking for a skilled software developer with experience in React and Node.js', 'Davao City', '25,001 - 30,000', true),
('IT Support Specialist', 'Global Corp', 'Provide technical support to our growing team', 'Metro Manila', '20,001 - 25,000', true);

-- Success message
SELECT 'Database setup completed successfully! All tables, policies, and functions have been created.' as status;
