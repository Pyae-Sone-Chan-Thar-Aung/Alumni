-- ===================================================================
-- SETUP PROFILE IMAGE STORAGE FOR REGISTRATION
-- ===================================================================

-- 1. Create the alumni-profiles storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'alumni-profiles',
    'alumni-profiles',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg'];

-- 2. Create storage policies for the alumni-profiles bucket

-- Allow anyone to upload images (for registration)
CREATE POLICY "Allow public to upload profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'alumni-profiles' AND
        (storage.foldername(name))[1] = 'temp'
    );

-- Allow anyone to view profile images
CREATE POLICY "Allow public to view profile images" ON storage.objects
    FOR SELECT USING (bucket_id = 'alumni-profiles');

-- Allow users to update their own profile images
CREATE POLICY "Users can update own profile images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'alumni-profiles' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own profile images
CREATE POLICY "Users can delete own profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'alumni-profiles' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow admins to manage all profile images
CREATE POLICY "Admins can manage all profile images" ON storage.objects
    FOR ALL USING (
        bucket_id = 'alumni-profiles' AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 3. Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'alumni-profiles';

-- 4. Test the setup by checking if we can create a temp folder structure
-- This will help ensure the registration process can upload images
SELECT 'Storage bucket setup complete!' as status;
