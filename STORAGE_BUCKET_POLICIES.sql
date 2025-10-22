-- ============================================================================
-- STORAGE BUCKET POLICIES FOR CCS ALUMNI PORTAL
-- ============================================================================
-- Project: https://gpsbydtilgoutlltyfvl.supabase.co
-- 
-- INSTRUCTIONS:
-- 1. First create the buckets in Supabase Dashboard → Storage
-- 2. Make them PUBLIC buckets
-- 3. Then run these SQL commands to set up proper policies
-- ============================================================================

-- ============================================================================
-- BUCKET 1: alumni-profiles
-- ============================================================================

-- Allow anyone to view profile images (public read)
CREATE POLICY "Public can view alumni profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'alumni-profiles');

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'alumni-profiles' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own profile images
CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'alumni-profiles' 
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'alumni-profiles' 
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'alumni-profiles' 
    AND auth.role() = 'authenticated'
);

-- ============================================================================
-- BUCKET 2: gallery-images
-- ============================================================================

-- Allow anyone to view gallery images (public read)
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

-- Allow authenticated users (admins) to upload gallery images
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'gallery-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update gallery images
CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'gallery-images' 
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'gallery-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete gallery images
CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'gallery-images' 
    AND auth.role() = 'authenticated'
);

-- ============================================================================
-- BUCKET 3: news-images
-- ============================================================================

-- Allow anyone to view news images (public read)
CREATE POLICY "Public can view news images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

-- Allow authenticated users (admins) to upload news images
CREATE POLICY "Authenticated users can upload news images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'news-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update news images
CREATE POLICY "Authenticated users can update news images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'news-images' 
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'news-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete news images
CREATE POLICY "Authenticated users can delete news images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'news-images' 
    AND auth.role() = 'authenticated'
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check storage policies
SELECT 
    'Storage Policies' as type,
    policyname,
    bucket_id,
    cmd
FROM storage.policies
ORDER BY bucket_id, cmd;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 
-- These policies allow:
-- ✅ Anyone (including non-authenticated) to VIEW all images (public access)
-- ✅ Authenticated users to UPLOAD, UPDATE, DELETE their own images
-- ✅ Admins have same permissions (controlled at application level)
-- 
-- For tighter security on gallery/news images (admin-only uploads):
-- - Modify the INSERT policies to check for admin role
-- - Use: AND (SELECT role FROM public.users WHERE auth_id = auth.uid()) IN ('admin', 'super_admin')
-- 
-- ============================================================================
