-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON public.gallery_albums;
DROP POLICY IF EXISTS "Enable all for admin users" ON public.gallery_albums;
DROP POLICY IF EXISTS "Enable read access for all users on images" ON public.gallery_images;
DROP POLICY IF EXISTS "Enable all for admin users on images" ON public.gallery_images;

-- Create simplified RLS policies for gallery_albums
-- Allow public read access to published albums
CREATE POLICY "Public read access for published albums" 
ON public.gallery_albums 
FOR SELECT 
USING (is_published = true);

-- Allow authenticated users to manage albums (simplified - you can restrict this further later)
CREATE POLICY "Authenticated users can manage albums" 
ON public.gallery_albums 
FOR ALL
USING (auth.role() = 'authenticated');

-- Create simplified RLS policies for gallery_images
-- Allow public read access to images from published albums
CREATE POLICY "Public read access for images from published albums" 
ON public.gallery_images 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.gallery_albums 
    WHERE gallery_albums.id = gallery_images.album_id 
    AND gallery_albums.is_published = true
));

-- Allow authenticated users to manage images (simplified)
CREATE POLICY "Authenticated users can manage images" 
ON public.gallery_images 
FOR ALL
USING (auth.role() = 'authenticated');

-- Alternative: If you want to disable RLS temporarily for testing
-- ALTER TABLE public.gallery_albums DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.gallery_images DISABLE ROW LEVEL SECURITY;
