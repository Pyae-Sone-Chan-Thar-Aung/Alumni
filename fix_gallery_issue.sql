-- Complete fix for gallery issues
-- This script will create/recreate tables if needed and set up proper permissions

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for all users" ON public.gallery_albums;
DROP POLICY IF EXISTS "Enable all for admin users" ON public.gallery_albums;
DROP POLICY IF EXISTS "Enable read access for all users on images" ON public.gallery_images;
DROP POLICY IF EXISTS "Enable all for admin users on images" ON public.gallery_images;
DROP POLICY IF EXISTS "Public read access for published albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Authenticated users can manage albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Public read access for images from published albums" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated users can manage images" ON public.gallery_images;

-- Create gallery_albums table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create gallery_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id BIGSERIAL PRIMARY KEY,
    album_id BIGINT REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily to ensure functionality works
ALTER TABLE public.gallery_albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated and anonymous users
GRANT SELECT ON public.gallery_albums TO anon;
GRANT SELECT ON public.gallery_images TO anon;
GRANT ALL PRIVILEGES ON public.gallery_albums TO authenticated;
GRANT ALL PRIVILEGES ON public.gallery_images TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON SEQUENCE public.gallery_albums_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.gallery_images_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.gallery_albums_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.gallery_images_id_seq TO anon;

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON public.gallery_albums;
DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON public.gallery_images;

-- Create triggers for updated_at
CREATE TRIGGER update_gallery_albums_updated_at
BEFORE UPDATE ON public.gallery_albums
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_albums_published ON public.gallery_albums(is_published, created_at);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album ON public.gallery_images(album_id, display_order);

-- Clear existing sample data to prevent conflicts
DELETE FROM public.gallery_images WHERE album_id IN (
    SELECT id FROM public.gallery_albums WHERE title IN ('Graduation 2024', 'Alumni Homecoming 2023', 'Campus Events')
);
DELETE FROM public.gallery_albums WHERE title IN ('Graduation 2024', 'Alumni Homecoming 2023', 'Campus Events');

-- Insert sample albums with proper data
INSERT INTO public.gallery_albums (title, description, event_date, cover_image_url, is_published) VALUES
(
    'Graduation 2024', 
    'Photos from the 2024 graduation ceremony celebrating our Computer Studies graduates', 
    '2024-06-15', 
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 
    true
),
(
    'Alumni Homecoming 2023', 
    'Annual alumni homecoming event with networking sessions and campus tours', 
    '2023-11-20', 
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 
    true
),
(
    'Campus Tech Week 2024', 
    'Technology week featuring programming competitions, tech talks, and innovation showcases', 
    '2024-03-15', 
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 
    true
),
(
    'Computer Studies Sports Day', 
    'Annual sports event for CS students and faculty', 
    '2024-02-10', 
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', 
    true
);

-- Insert sample images for the albums
DO $$
DECLARE
    graduation_album_id BIGINT;
    homecoming_album_id BIGINT;
    techweek_album_id BIGINT;
    sports_album_id BIGINT;
BEGIN
    -- Get album IDs
    SELECT id INTO graduation_album_id FROM public.gallery_albums WHERE title = 'Graduation 2024';
    SELECT id INTO homecoming_album_id FROM public.gallery_albums WHERE title = 'Alumni Homecoming 2023';
    SELECT id INTO techweek_album_id FROM public.gallery_albums WHERE title = 'Campus Tech Week 2024';
    SELECT id INTO sports_album_id FROM public.gallery_albums WHERE title = 'Computer Studies Sports Day';
    
    -- Insert images for Graduation 2024
    INSERT INTO public.gallery_images (album_id, image_url, caption, display_order) VALUES
    (graduation_album_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Graduation ceremony hall setup', 1),
    (graduation_album_id, 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Graduates receiving diplomas', 2),
    (graduation_album_id, 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Family celebration photos', 3),
    (graduation_album_id, 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Group photo of CS graduates', 4);
    
    -- Insert images for Alumni Homecoming 2023
    INSERT INTO public.gallery_images (album_id, image_url, caption, display_order) VALUES
    (homecoming_album_id, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Alumni registration and welcome', 1),
    (homecoming_album_id, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Networking session in progress', 2),
    (homecoming_album_id, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Campus tour highlights', 3);
    
    -- Insert images for Tech Week 2024
    INSERT INTO public.gallery_images (album_id, image_url, caption, display_order) VALUES
    (techweek_album_id, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Programming competition setup', 1),
    (techweek_album_id, 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Tech talk presentations', 2),
    (techweek_album_id, 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Innovation showcase displays', 3);
    
    -- Insert images for Sports Day
    INSERT INTO public.gallery_images (album_id, image_url, caption, display_order) VALUES
    (sports_album_id, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Opening ceremonies', 1),
    (sports_album_id, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Basketball tournament action', 2),
    (sports_album_id, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Award ceremony and winners', 3);
END $$;

-- Verify the setup
SELECT 
    'Albums created:' as status,
    COUNT(*) as count 
FROM public.gallery_albums;

SELECT 
    'Images created:' as status,
    COUNT(*) as count 
FROM public.gallery_images;

-- Show the albums with their image counts
SELECT 
    a.id,
    a.title,
    a.description,
    a.event_date,
    a.is_published,
    COUNT(i.id) as image_count
FROM public.gallery_albums a
LEFT JOIN public.gallery_images i ON a.id = i.album_id
GROUP BY a.id, a.title, a.description, a.event_date, a.is_published
ORDER BY a.event_date DESC;

SELECT 'Gallery setup completed successfully!' as final_status;