-- Fix Tracer Study RLS Policies (Corrected Version)
-- Run this in your Supabase SQL Editor

-- Check if RLS is enabled
SELECT 'Current RLS status:' as info;
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables pt
JOIN pg_class pc ON pt.tablename = pc.relname
WHERE tablename = 'tracer_study_responses';

-- Check existing policies
SELECT 'Current RLS policies:' as info;
SELECT 
    policyname as policy_name,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'tracer_study_responses';

-- Drop existing policies if they exist (to recreate them correctly)
DROP POLICY IF EXISTS "Users can view their own tracer study response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can insert their own tracer study response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can update their own tracer study response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Users can delete their own tracer study response" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Admins can view all tracer study responses" ON public.tracer_study_responses;
DROP POLICY IF EXISTS "Admins can manage all tracer study responses" ON public.tracer_study_responses;

-- Create the correct RLS policies
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

-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
RETURNS boolean AS
$$
BEGIN
    -- Check if user has admin role in users table
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policies
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
SELECT 'Updated RLS policies:' as info;
SELECT 
    policyname as policy_name,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'tracer_study_responses'
ORDER BY policyname;

-- Test if the current user can access the table
SELECT 'Testing access:' as info;
SELECT 'Current auth.uid(): ' || COALESCE(auth.uid()::text, 'NULL') as current_user;

SELECT 'RLS policies have been fixed! Users should now be able to submit tracer study responses.' as status;