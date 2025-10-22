-- Fix Tracer Study RLS Policies
-- Run this in your Supabase SQL Editor

-- Check if RLS is enabled and what policies exist
SELECT 'Current RLS status:' as info;
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    hasbypassrls as has_bypass_rls
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

-- Check if is_admin function exists (needed for admin policies)
SELECT 'Checking if is_admin function exists:' as info;
SELECT EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'is_admin'
) as is_admin_function_exists;

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

-- Policy 5: Admin policies (if is_admin function exists)
-- Check if we need to create the is_admin function first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        -- Create a simple is_admin function if it doesn't exist
        CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid)
        RETURNS boolean AS
        $func$
        BEGIN
            -- Check if user has admin role in users table
            RETURN EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = user_uuid AND role = 'admin'
            );
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;
END
$$;

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
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'tracer_study_responses'
ORDER BY policyname;

SELECT 'RLS policies have been fixed! Users should now be able to submit tracer study responses.' as status;