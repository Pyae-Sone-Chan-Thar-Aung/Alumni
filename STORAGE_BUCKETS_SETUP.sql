-- ===================================================================
-- CCS ALUMNI PORTAL - STORAGE BUCKETS SETUP
-- ===================================================================
-- This script creates all storage buckets and RLS policies
-- for file management across the entire system.
--
-- BUCKETS CREATED:
-- 1. profiles (public) - User profile avatars
-- 2. registration-documents (private) - Registration verification docs
-- 3. news (public) - News article images
-- 4. gallery (public) - Event photos and album images
-- 5. jobs (public) - Company logos and job images
-- 6. tracer-study-documents (private) - Survey supporting documents
--
-- INSTRUCTIONS:
-- 1. Review the STORAGE_BUCKETS_STRATEGY.md document first
-- 2. Run this entire script in your Supabase SQL Editor
-- 3. Verify buckets are created in Storage dashboard
-- 4. Test file uploads with different user roles
-- ===================================================================

-- ===================================================================
-- SECTION 1: DROP EXISTING BUCKETS (OPTIONAL - UNCOMMENT IF NEEDED)
-- ===================================================================
-- WARNING: This will delete all files in these buckets!
-- Only uncomment if you need to start fresh

-- DELETE FROM storage.buckets WHERE id IN (
--     'profiles',
--     'registration-documents',
--     'news',
--     'gallery',
--     'jobs',
--     'tracer-study-documents'
-- );

-- ===================================================================
-- SECTION 2: CREATE STORAGE BUCKETS
-- ===================================================================

-- 2.1: profiles (public) - User avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profiles',
    'profiles',
    true,  -- Public bucket for fast CDN access
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 2.2: registration-documents (private) - Verification docs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'registration-documents',
    'registration-documents',
    false,  -- Private - sensitive documents
    10485760,  -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

-- 2.3: news (public) - News images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'news',
    'news',
    true,  -- Public for news images
    10485760,  -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 2.4: gallery (public) - Event photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery',
    'gallery',
    true,  -- Public for event photos
    10485760,  -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 2.5: jobs (public) - Company logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'jobs',
    'jobs',
    true,  -- Public for job postings
    2097152,  -- 2MB limit (logos are smaller)
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];

-- 2.6: tracer-study-documents (private) - Survey attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tracer-study-documents',
    'tracer-study-documents',
    false,  -- Private - survey data
    10485760,  -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

-- ===================================================================
-- SECTION 3: HELPER FUNCTIONS
-- ===================================================================

-- 3.1: Ensure is_admin() function exists (should already exist from database schema)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- ===================================================================
-- SECTION 4: DROP EXISTING STORAGE POLICIES
-- ===================================================================

-- Drop all existing policies for clean slate
DROP POLICY IF EXISTS "Public read profiles" ON storage.objects;
DROP POLICY IF EXISTS "Owners insert profiles" ON storage.objects;
DROP POLICY IF EXISTS "Owners update profiles" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete profiles" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage profiles" ON storage.objects;

DROP POLICY IF EXISTS "Owners read registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners insert registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners update registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins read registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage registration documents" ON storage.objects;

DROP POLICY IF EXISTS "Public read news" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage news" ON storage.objects;

DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage gallery" ON storage.objects;

DROP POLICY IF EXISTS "Public read jobs" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage jobs" ON storage.objects;

DROP POLICY IF EXISTS "Owners read tracer study documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners insert tracer study documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners update tracer study documents" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete tracer study documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins read tracer study documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage tracer study documents" ON storage.objects;

-- ===================================================================
-- SECTION 5: PROFILES BUCKET POLICIES
-- ===================================================================

-- 5.1: Public can read profile images (for displaying avatars)
CREATE POLICY "Public read profiles"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- 5.2: Authenticated users can upload their own profile images
-- Path structure: {user_id}/avatar.ext
CREATE POLICY "Owners insert profiles"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profiles'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5.3: Users can update their own profile images
CREATE POLICY "Owners update profiles"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profiles'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'profiles'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5.4: Users can delete their own profile images
CREATE POLICY "Owners delete profiles"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profiles'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5.5: Admins can manage all profile images
CREATE POLICY "Admins manage profiles"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'profiles'
    AND public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'profiles'
    AND public.is_admin(auth.uid())
);

-- ===================================================================
-- SECTION 6: REGISTRATION-DOCUMENTS BUCKET POLICIES
-- ===================================================================

-- 6.1: Owners can read their own registration documents
CREATE POLICY "Owners read registration documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'registration-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6.2: Owners can upload their registration documents
CREATE POLICY "Owners insert registration documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'registration-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6.3: Owners can update their registration documents (before approval)
CREATE POLICY "Owners update registration documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'registration-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'registration-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6.4: Only admins can delete registration documents
CREATE POLICY "Owners delete registration documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'registration-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6.5: Admins can read all registration documents (for approval process)
CREATE POLICY "Admins read registration documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'registration-documents'
    AND public.is_admin(auth.uid())
);

-- 6.6: Admins can manage all registration documents
CREATE POLICY "Admins manage registration documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'registration-documents'
    AND public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'registration-documents'
    AND public.is_admin(auth.uid())
);

-- ===================================================================
-- SECTION 7: NEWS BUCKET POLICIES
-- ===================================================================

-- 7.1: Public can read news images
CREATE POLICY "Public read news"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'news');

-- 7.2: Only admins can manage news images
CREATE POLICY "Admins manage news"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'news'
    AND public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'news'
    AND public.is_admin(auth.uid())
);

-- ===================================================================
-- SECTION 8: GALLERY BUCKET POLICIES
-- ===================================================================

-- 8.1: Public can read gallery images
CREATE POLICY "Public read gallery"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- 8.2: Only admins can manage gallery images
CREATE POLICY "Admins manage gallery"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'gallery'
    AND public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'gallery'
    AND public.is_admin(auth.uid())
);

-- ===================================================================
-- SECTION 9: JOBS BUCKET POLICIES
-- ===================================================================

-- 9.1: Public can read job images/logos
CREATE POLICY "Public read jobs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'jobs');

-- 9.2: Only admins can manage job images
-- Note: If you want to allow job posters (companies) to manage their own,
-- you'll need to add additional logic based on job_opportunities ownership
CREATE POLICY "Admins manage jobs"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'jobs'
    AND public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'jobs'
    AND public.is_admin(auth.uid())
);

-- ===================================================================
-- SECTION 10: TRACER-STUDY-DOCUMENTS BUCKET POLICIES
-- ===================================================================

-- 10.1: Owners can read their own tracer study documents
CREATE POLICY "Owners read tracer study documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'tracer-study-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 10.2: Owners can upload their tracer study documents
CREATE POLICY "Owners insert tracer study documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'tracer-study-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 10.3: Owners can update their tracer study documents
CREATE POLICY "Owners update tracer study documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'tracer-study-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'tracer-study-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 10.4: Owners can delete their tracer study documents
CREATE POLICY "Owners delete tracer study documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'tracer-study-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 10.5: Admins can read all tracer study documents (for analysis)
CREATE POLICY "Admins read tracer study documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'tracer-study-documents'
    AND public.is_admin(auth.uid())
);

-- 10.6: Admins can manage all tracer study documents
CREATE POLICY "Admins manage tracer study documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'tracer-study-documents'
    AND public.is_admin(auth.uid())
)
WITH CHECK (
    bucket_id = 'tracer-study-documents'
    AND public.is_admin(auth.uid())
);

-- ===================================================================
-- SECTION 11: VERIFICATION QUERIES
-- ===================================================================

-- 11.1: Check all buckets were created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id IN (
    'profiles',
    'registration-documents',
    'news',
    'gallery',
    'jobs',
    'tracer-study-documents'
)
ORDER BY id;

-- 11.2: Check all policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'objects'
    AND schemaname = 'storage'
ORDER BY policyname;

-- 11.3: Count policies per bucket
SELECT 
    CASE 
        WHEN policyname LIKE '%profiles%' THEN 'profiles'
        WHEN policyname LIKE '%registration%' THEN 'registration-documents'
        WHEN policyname LIKE '%news%' THEN 'news'
        WHEN policyname LIKE '%gallery%' THEN 'gallery'
        WHEN policyname LIKE '%jobs%' THEN 'jobs'
        WHEN policyname LIKE '%tracer%' THEN 'tracer-study-documents'
        ELSE 'other'
    END as bucket,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'objects'
    AND schemaname = 'storage'
GROUP BY bucket
ORDER BY bucket;

-- ===================================================================
-- SETUP COMPLETE!
-- ===================================================================
-- 
-- Next steps:
-- 1. Verify all 6 buckets appear in Storage dashboard
-- 2. Test file uploads with admin and regular user accounts
-- 3. Update your frontend code to use these bucket names
-- 4. Monitor storage usage and adjust file size limits as needed
-- 
-- Bucket Summary:
-- ✅ profiles (public) - 5MB limit - Profile avatars
-- ✅ registration-documents (private) - 10MB limit - Verification docs
-- ✅ news (public) - 10MB limit - News images
-- ✅ gallery (public) - 10MB limit - Event photos
-- ✅ jobs (public) - 2MB limit - Company logos
-- ✅ tracer-study-documents (private) - 10MB limit - Survey attachments
-- 
-- Total policies created: ~26 policies
-- 
-- ===================================================================
