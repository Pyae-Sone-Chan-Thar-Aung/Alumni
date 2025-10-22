-- Create gallery_albums table
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

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id BIGSERIAL PRIMARY KEY,
    album_id BIGINT REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on gallery_albums
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

-- Enable RLS on gallery_images  
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gallery_albums
CREATE POLICY "Enable read access for all users" 
ON public.gallery_albums 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Enable all for admin users" 
ON public.gallery_albums 
FOR ALL
USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create RLS policies for gallery_images
CREATE POLICY "Enable read access for all users on images" 
ON public.gallery_images 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.gallery_albums 
    WHERE gallery_albums.id = gallery_images.album_id 
    AND gallery_albums.is_published = true
));

CREATE POLICY "Enable all for admin users on images" 
ON public.gallery_images 
FOR ALL
USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create function to update updated_at timestamp
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
CREATE INDEX IF NOT EXISTS idx_gallery_albums_published ON public.gallery_albums(is_published, created_at);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album ON public.gallery_images(album_id, display_order);

-- Insert some sample albums for testing
INSERT INTO public.gallery_albums (title, description, event_date, is_published) VALUES
('Graduation 2024', 'Photos from the 2024 graduation ceremony', '2024-06-15', true),
('Alumni Homecoming 2023', 'Annual alumni homecoming event', '2023-11-20', true),
('Campus Events', 'Various campus activities and events', '2024-01-01', true)
ON CONFLICT DO NOTHING;
