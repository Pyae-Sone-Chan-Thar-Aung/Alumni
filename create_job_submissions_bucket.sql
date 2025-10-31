-- ===================================================================
-- CREATE JOB-SUBMISSIONS STORAGE BUCKET
-- ===================================================================
-- This script creates the storage bucket for job submission files
-- (PDFs and images uploaded by alumni when posting job opportunities)
-- ===================================================================

-- Create the job-submissions bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'job-submissions',
    'job-submissions',
    true,  -- Public so job postings can be viewed by all users
    5242880,  -- 5MB limit (matching the frontend validation)
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

-- ===================================================================
-- DROP EXISTING POLICIES (if any)
-- ===================================================================
DROP POLICY IF EXISTS "Public read job submissions" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users insert job submissions" ON storage.objects;
DROP POLICY IF EXISTS "Owners update job submissions" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete job submissions" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage job submissions" ON storage.objects;

-- ===================================================================
-- CREATE STORAGE POLICIES
-- ===================================================================

-- 1. Public can read job submission files (for viewing job postings)
CREATE POLICY "Public read job submissions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'job-submissions');

-- 2. Authenticated users can upload job submissions
-- Path structure: submissions/{timestamp}_{user_id}.{ext}
CREATE POLICY "Authenticated users insert job submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'job-submissions'
    AND auth.role() = 'authenticated'
);

-- 3. Users can update their own job submission files
CREATE POLICY "Owners update job submissions"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'job-submissions'
    AND auth.uid()::text = (string_to_array(name, '_'))[2]::text
)
WITH CHECK (
    bucket_id = 'job-submissions'
    AND auth.uid()::text = (string_to_array(name, '_'))[2]::text
);

-- 4. Users can delete their own job submission files
CREATE POLICY "Owners delete job submissions"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'job-submissions'
    AND auth.uid()::text = (string_to_array(name, '_'))[2]::text
);

-- 5. Admins can manage all job submission files
CREATE POLICY "Admins manage job submissions"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'job-submissions'
    AND public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'job-submissions'
    AND public.is_admin(auth.uid())
);

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Verify bucket was created
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types,
    created_at 
FROM storage.buckets 
WHERE id = 'job-submissions';

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%job submissions%'
ORDER BY policyname;
