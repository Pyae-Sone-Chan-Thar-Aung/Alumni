-- Fix Tracer Study RLS Policies (Simple Version)
-- Run this in your Supabase SQL Editor
-- This only creates the missing policies without touching the existing is_admin function

-- Check if RLS is enabled
SELECT 'Current RLS status:' as info;
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables pt
JOIN pg_class pc ON pt.tablename = pc.relname
WHERE tablename = 'tracer_study_responses';

-- Check existing policies
SELECT 'Current RLS policies on tracer_study_responses:' as info;
SELECT 
    policyname as policy_name,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'tracer_study_responses';

-- Drop existing tracer study policies if they exist (to recreate them correctly)
DROP POLICY IF EXISTS "Users can view their own tracer study response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can insert their own tracer study response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can update their own tracer study response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can delete their own tracer study response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Admins can view all tracer study responses" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Admins can manage all tracer study responses" ON public.tracer_study_responses;

-- Create the correct RLS policies for tracer study responses
-- Policy 1: Users can view their own response
CREATE POLICY "Users can view their own tracer study response" 
ON public.tracer_study_responses
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own response
CREATE POLICY "Users can insert their own tracer study response" 
ON public.tracer_study_responses
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own response
CREATE POLICY "Users can update their own tracer study response" 
ON public.tracer_study_responses
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own response (optional)
CREATE POLICY "Users can delete their own tracer study response" 
ON public.tracer_study_responses
FOR DELETE 
USING (auth.uid() = user_id);

-- Policy 5: Admin policies using the existing is_admin function
CREATE POLICY "Admins can view all tracer study responses" 
ON public.tracer_study_responses
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all tracer study responses" 
ON public.tracer_study_responses
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Verify the policies were created
SELECT 'Updated RLS policies on tracer_study_responses:' as info;
SELECT 
    policyname as policy_name,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'tracer_study_responses'
ORDER BY policyname;

-- Test that the existing is_admin function works
SELECT 'Testing existing is_admin function:' as info;
SELECT is_admin(auth.uid()) as current_user_is_admin;

-- Test access to the table
SELECT 'Testing table access:' as info;
SELECT COUNT(*) as existing_responses_count FROM public.tracer_study_responses;

SELECT 'RLS policies for tracer study have been created successfully! Users should now be able to submit responses.' as status;