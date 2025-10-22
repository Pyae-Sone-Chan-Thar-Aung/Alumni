-- Final Database Setup Script for CCS Alumni Portal
-- Execute this script in your Supabase SQL Editor to ensure all features are working

-- 1. Fix News Table Schema (Add missing columns)
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Announcement',
ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have published_at if they are published
UPDATE public.news 
SET published_at = created_at 
WHERE is_published = true AND published_at IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_important ON public.news(is_important);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at);

-- 2. Ensure Gallery Tables Exist
CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 3. Create Storage Buckets (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('alumni-profiles', 'alumni-profiles', true),
    ('gallery-images', 'gallery-images', true),
    ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Set up RLS Policies for Gallery
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Gallery Albums Policies
DROP POLICY IF EXISTS "Anyone can view active albums" ON public.gallery_albums;
CREATE POLICY "Anyone can view active albums" ON public.gallery_albums
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage albums" ON public.gallery_albums;
CREATE POLICY "Admins can manage albums" ON public.gallery_albums
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Gallery Images Policies
DROP POLICY IF EXISTS "Anyone can view active images" ON public.gallery_images;
CREATE POLICY "Anyone can view active images" ON public.gallery_images
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage images" ON public.gallery_images;
CREATE POLICY "Admins can manage images" ON public.gallery_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Storage Policies for Gallery Images
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
CREATE POLICY "Anyone can view gallery images" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
CREATE POLICY "Admins can upload gallery images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'gallery-images' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update gallery images" ON storage.objects;
CREATE POLICY "Admins can update gallery images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'gallery-images' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete gallery images" ON storage.objects;
CREATE POLICY "Admins can delete gallery images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'gallery-images' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Ensure Job Opportunities Table is Complete
ALTER TABLE public.job_opportunities 
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS application_deadline DATE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT 'Full-time',
ADD COLUMN IF NOT EXISTS salary_range TEXT,
ADD COLUMN IF NOT EXISTS application_url TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 7. Add Sample Data for Testing (if tables are empty)
INSERT INTO public.gallery_albums (title, description, is_active)
SELECT 'CCS Events 2024', 'Collection of CCS events and activities from 2024', true
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_albums LIMIT 1);

INSERT INTO public.gallery_albums (title, description, is_active)
SELECT 'Alumni Homecoming', 'Photos from the annual alumni homecoming event', true
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_albums WHERE title = 'Alumni Homecoming');

-- 8. Create Functions for Better Performance
CREATE OR REPLACE FUNCTION public.get_active_news()
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    is_important BOOLEAN,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.title, n.content, n.category, n.is_important, n.published_at, n.created_at
    FROM public.news n
    WHERE n.is_published = true
    ORDER BY n.is_important DESC, n.published_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update Triggers for Updated_at Columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gallery_albums_updated_at ON public.gallery_albums;
CREATE TRIGGER update_gallery_albums_updated_at
    BEFORE UPDATE ON public.gallery_albums
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Verify All Tables Exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    -- Check for required tables
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'users', 'user_profiles', 'pending_registrations', 'news', 
            'job_opportunities', 'tracer_study_responses', 'gallery_albums', 
            'gallery_images', 'programs'
        ])
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All required tables exist!';
    END IF;
END $$;

-- Success message
SELECT 'CCS Alumni Portal database setup completed successfully!' as status,
       'All tables, policies, and functions have been created/updated.' as details;
