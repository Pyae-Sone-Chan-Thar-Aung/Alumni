-- Fix Storage Bucket and Policies for Profile Images
-- This script ensures the storage bucket is properly configured

-- Create storage bucket for profile images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'alumni-profiles', 
    'alumni-profiles', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png'];

-- Drop existing storage policies
DROP POLICY IF EXISTS "Alumni can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Alumni can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Alumni can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Alumni can delete their own profile images" ON storage.objects;

-- Create new storage policies that work with authentication
CREATE POLICY "Anyone can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'alumni-profiles');

CREATE POLICY "Anyone can view profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'alumni-profiles');

CREATE POLICY "Anyone can update profile images" ON storage.objects
FOR UPDATE USING (bucket_id = 'alumni-profiles');

CREATE POLICY "Anyone can delete profile images" ON storage.objects
FOR DELETE USING (bucket_id = 'alumni-profiles');

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

COMMIT;
