-- Create gallery tables from scratch (handles missing tables/sequences)
-- This script will work even if tables don't exist

-- Drop existing tables if they exist (this will also drop sequences)
DROP TABLE IF EXISTS public.gallery_images CASCADE;
DROP TABLE IF EXISTS public.gallery_albums CASCADE;

-- Create gallery_albums table with proper BIGSERIAL (auto-creates sequence)
CREATE TABLE public.gallery_albums (
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

-- Create gallery_images table with proper BIGSERIAL (auto-creates sequence)
CREATE TABLE public.gallery_images (
    id BIGSERIAL PRIMARY KEY,
    album_id BIGINT REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now to ensure functionality works
ALTER TABLE public.gallery_albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon (for public access) and authenticated users
GRANT SELECT ON public.gallery_albums TO anon;
GRANT SELECT ON public.gallery_images TO anon;
GRANT ALL PRIVILEGES ON public.gallery_albums TO authenticated;
GRANT ALL PRIVILEGES ON public.gallery_images TO authenticated;

-- Grant sequence permissions (sequences are auto-created with BIGSERIAL)
GRANT USAGE, SELECT ON SEQUENCE public.gallery_albums_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.gallery_images_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.gallery_albums_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.gallery_images_id_seq TO anon;

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
CREATE INDEX idx_gallery_albums_published ON public.gallery_albums(is_published, created_at);
CREATE INDEX idx_gallery_images_album ON public.gallery_images(album_id, display_order);

-- Insert sample albums with working Unsplash images
INSERT INTO public.gallery_albums (title, description, event_date, cover_image_url, is_published) VALUES
(
    'Graduation 2024', 
    'Photos from the 2024 graduation ceremony celebrating our Computer Studies graduates', 
    '2024-06-15', 
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 
    true
),
(
    'Alumni Homecoming 2023', 
    'Annual alumni homecoming event with networking sessions and campus tours', 
    '2023-11-20', 
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 
    true
),
(
    'Campus Tech Week 2024', 
    'Technology week featuring programming competitions, tech talks, and innovation showcases', 
    '2024-03-15', 
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 
    true
),
(
    'Computer Studies Sports Day', 
    'Annual sports event for CS students and faculty', 
    '2024-02-10', 
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 
    true
);

-- Insert sample images for the albums (using album IDs dynamically)
DO $$
DECLARE
    graduation_id BIGINT;
    homecoming_id BIGINT;
    techweek_id BIGINT;
    sports_id BIGINT;
BEGIN
    -- Get the album IDs that were just created
    SELECT id INTO graduation_id FROM public.gallery_albums WHERE title = 'Graduation 2024';
    SELECT id INTO homecoming_id FROM public.gallery_albums WHERE title = 'Alumni Homecoming 2023';
    SELECT id INTO techweek_id FROM public.gallery_albums WHERE title = 'Campus Tech Week 2024';
    SELECT id INTO sports_id FROM public.gallery_albums WHERE title = 'Computer Studies Sports Day';
    
    -- Insert images for Graduation 2024
    INSERT INTO public.gallery_images (album_id, image_url, caption, display_order) VALUES
    (graduation_id, 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Graduation ceremony hall setup', 1),
    (graduation_id, 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Graduates receiving diplomas', 2),
    (graduation_id, 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Family celebration photos', 3);
    
    -- Insert images for Alumni Homecoming 2023
    INSERT INTO public.gallery_images (album_id, image_url, caption, display_order) VALUES
    (homecoming_id, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Alumni registration and welcome', 1),
    (homecoming_id, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Networking session in progress', 2),
    (homecoming_id, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Campus tour highlights', 3);
    
    -- Insert images for Tech Week 2024
    INSERT INTO public.gallery_images (album_id, image_url, caption, display_order) VALUES
    (techweek_id, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Programming competition setup', 1),
    (techweek_id, 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Tech talk presentations', 2);
    
    -- Insert images for Sports Day
    INSERT INTO public.gallery_images (album_id, image_url, caption, display_order) VALUES
    (sports_id, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Opening ceremonies', 1),
    (sports_id, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Basketball tournament action', 2);
    
    RAISE NOTICE 'Sample data inserted successfully!';
END $$;

-- Final verification
SELECT 
    'Albums created: ' || COUNT(*) as status
FROM public.gallery_albums;

SELECT 
    'Images created: ' || COUNT(*) as status  
FROM public.gallery_images;

SELECT 'Gallery setup completed successfully! 🎉' as final_status;