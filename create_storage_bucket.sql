-- Create storage bucket for gallery images (matching the code expectation)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for gallery bucket
-- Allow public read access
CREATE POLICY "Public read access for gallery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update gallery images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'gallery' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete gallery images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'gallery' 
  AND auth.role() = 'authenticated'
);
