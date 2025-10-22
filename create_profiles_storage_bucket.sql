-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profiles bucket (drop existing ones first if they exist)
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete profile images" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read access for profile images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload profile images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update profile images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete profile images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profiles' 
  AND auth.role() = 'authenticated'
);
