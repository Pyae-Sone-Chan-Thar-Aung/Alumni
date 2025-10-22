-- =============================================================================
-- UIC Alumni Portal - Complete Database Setup Script
-- This script ensures all tables, policies, and storage buckets are configured
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- STORAGE BUCKETS SETUP
-- =============================================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('alumni-profiles', 'alumni-profiles', true),
  ('gallery-images', 'gallery-images', true),
  ('news-images', 'news-images', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Alumni Profiles bucket policies
DROP POLICY IF EXISTS "Alumni can upload their own profile images" ON storage.objects;
CREATE POLICY "Alumni can upload their own profile images"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'alumni-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Alumni can update their own profile images" ON storage.objects;
CREATE POLICY "Alumni can update their own profile images"
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'alumni-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'alumni-profiles');

-- Gallery Images bucket policies
DROP POLICY IF EXISTS "Admins can manage gallery images" ON storage.objects;
CREATE POLICY "Admins can manage gallery images"
ON storage.objects FOR ALL 
USING (bucket_id = 'gallery-images' AND EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery-images');

-- News Images bucket policies  
DROP POLICY IF EXISTS "Admins can manage news images" ON storage.objects;
CREATE POLICY "Admins can manage news images"
ON storage.objects FOR ALL 
USING (bucket_id = 'news-images' AND EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Public can view news images" ON storage.objects;
CREATE POLICY "Public can view news images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'news-images');

-- Documents bucket policies
DROP POLICY IF EXISTS "Authenticated users can manage documents" ON storage.objects;
CREATE POLICY "Authenticated users can manage documents"
ON storage.objects FOR ALL 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- =============================================================================
-- ENSURE ALL TABLES HAVE PROPER RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracer_study_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE batchmate_messages ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users" ON users
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- User profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR SELECT USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Admins can manage profiles" ON user_profiles;
CREATE POLICY "Admins can manage profiles" ON user_profiles
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Pending registrations policies
DROP POLICY IF EXISTS "Anyone can insert pending registration" ON pending_registrations;
CREATE POLICY "Anyone can insert pending registration" ON pending_registrations
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage pending registrations" ON pending_registrations;
CREATE POLICY "Admins can manage pending registrations" ON pending_registrations
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- News policies
DROP POLICY IF EXISTS "Everyone can read published news" ON news;
CREATE POLICY "Everyone can read published news" ON news
FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Job opportunities policies
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON job_opportunities;
CREATE POLICY "Authenticated users can view jobs" ON job_opportunities
FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage jobs" ON job_opportunities;
CREATE POLICY "Admins can manage jobs" ON job_opportunities
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Tracer study responses policies
DROP POLICY IF EXISTS "Users can manage their own responses" ON tracer_study_responses;
CREATE POLICY "Users can manage their own responses" ON tracer_study_responses
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all responses" ON tracer_study_responses;
CREATE POLICY "Admins can view all responses" ON tracer_study_responses
FOR SELECT USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Gallery albums policies
DROP POLICY IF EXISTS "Everyone can view published albums" ON gallery_albums;
CREATE POLICY "Everyone can view published albums" ON gallery_albums
FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins can manage albums" ON gallery_albums;
CREATE POLICY "Admins can manage albums" ON gallery_albums
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Gallery images policies
DROP POLICY IF EXISTS "Everyone can view images from published albums" ON gallery_images;
CREATE POLICY "Everyone can view images from published albums" ON gallery_images
FOR SELECT USING (EXISTS (
  SELECT 1 FROM gallery_albums WHERE id = gallery_images.album_id AND published = true
));

DROP POLICY IF EXISTS "Admins can manage gallery images" ON gallery_images;
CREATE POLICY "Admins can manage gallery images" ON gallery_images
FOR ALL USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Batchmate messages policies
DROP POLICY IF EXISTS "Users can view their own messages" ON batchmate_messages;
CREATE POLICY "Users can view their own messages" ON batchmate_messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON batchmate_messages;
CREATE POLICY "Users can send messages" ON batchmate_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their sent messages" ON batchmate_messages;
CREATE POLICY "Users can update their sent messages" ON batchmate_messages
FOR UPDATE USING (auth.uid() = sender_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user is admin (used in policies)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DATA VALIDATION TRIGGERS
-- =============================================================================

-- Ensure email uniqueness across users and pending_registrations
CREATE OR REPLACE FUNCTION check_email_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email exists in users table
  IF EXISTS (SELECT 1 FROM users WHERE email = NEW.email AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
    RAISE EXCEPTION 'Email already exists in users table';
  END IF;
  
  -- Check if email exists in pending_registrations table (for pending_registrations inserts)
  IF TG_TABLE_NAME = 'pending_registrations' THEN
    IF EXISTS (SELECT 1 FROM pending_registrations WHERE email = NEW.email AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
      RAISE EXCEPTION 'Email already exists in pending registrations';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply email uniqueness trigger
DROP TRIGGER IF EXISTS check_user_email_uniqueness ON users;
CREATE TRIGGER check_user_email_uniqueness
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION check_email_uniqueness();

DROP TRIGGER IF EXISTS check_pending_email_uniqueness ON pending_registrations;
CREATE TRIGGER check_pending_email_uniqueness
  BEFORE INSERT OR UPDATE ON pending_registrations
  FOR EACH ROW EXECUTE FUNCTION check_email_uniqueness();

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Create indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_graduation_year ON user_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at);
CREATE INDEX IF NOT EXISTS idx_job_opportunities_created_at ON job_opportunities(created_at);
CREATE INDEX IF NOT EXISTS idx_tracer_study_responses_user_id ON tracer_study_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_tracer_study_responses_survey_year ON tracer_study_responses(survey_year);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_published ON gallery_albums(published);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_batchmate_messages_sender ON batchmate_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_batchmate_messages_receiver ON batchmate_messages(receiver_id);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify all tables exist and have RLS enabled
DO $$
DECLARE
  table_count INTEGER;
  bucket_count INTEGER;
BEGIN
  -- Check tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_profiles', 'pending_registrations', 'news', 'job_opportunities', 
                     'tracer_study_responses', 'gallery_albums', 'gallery_images', 'batchmate_messages');
  
  RAISE NOTICE 'Found % required tables', table_count;
  
  -- Check storage buckets
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE id IN ('alumni-profiles', 'gallery-images', 'news-images', 'documents');
  
  RAISE NOTICE 'Found % required storage buckets', bucket_count;
  
  IF table_count = 9 AND bucket_count = 4 THEN
    RAISE NOTICE '✅ Database setup completed successfully!';
  ELSE
    RAISE NOTICE '⚠️ Some components may be missing. Please review the setup.';
  END IF;
END $$;

-- Display summary
SELECT 
  'Database Setup Summary' as component,
  'Completed' as status,
  NOW() as timestamp;