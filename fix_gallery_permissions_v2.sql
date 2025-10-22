-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON public.gallery_albums;
DROP POLICY IF EXISTS "Enable all for admin users" ON public.gallery_albums;
DROP POLICY IF EXISTS "Enable read access for all users on images" ON public.gallery_images;
DROP POLICY IF EXISTS "Enable all for admin users on images" ON public.gallery_images;
DROP POLICY IF EXISTS "Public read access for published albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Authenticated users can manage albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Public read access for images from published albums" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated users can manage images" ON public.gallery_images;

-- Disable RLS temporarily to test functionality
ALTER TABLE public.gallery_albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.gallery_albums TO authenticated;
GRANT ALL ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_albums TO anon;
GRANT ALL ON public.gallery_images TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE public.gallery_albums_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.gallery_images_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.gallery_albums_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.gallery_images_id_seq TO anon;
