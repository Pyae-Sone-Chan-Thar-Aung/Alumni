-- Alumni Approval System Database Schema
-- This script creates the necessary database structure for the admin approval system

-- Add approval status columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);

-- Update existing users to have approved status (for existing data)
UPDATE users 
SET approval_status = 'approved', 
    is_verified = true,
    approved_at = NOW()
WHERE approval_status IS NULL OR approval_status = 'pending';

-- Add profile image URL to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- Create pending_registrations table for admin review
CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    course VARCHAR(100),
    batch_year VARCHAR(10),
    graduation_year VARCHAR(10),
    current_job VARCHAR(100),
    company VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    profile_image_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('alumni-profiles', 'alumni-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Alumni can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Alumni can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Alumni can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Alumni can delete their own profile images" ON storage.objects;

-- Set up storage policies for profile images
CREATE POLICY "Alumni can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'alumni-profiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Alumni can view profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'alumni-profiles');

CREATE POLICY "Alumni can update their own profile images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'alumni-profiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Alumni can delete their own profile images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'alumni-profiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_registration_date ON users(registration_date);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_submitted_at ON pending_registrations(submitted_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for pending_registrations table
DROP TRIGGER IF EXISTS update_pending_registrations_updated_at ON pending_registrations;
CREATE TRIGGER update_pending_registrations_updated_at
    BEFORE UPDATE ON pending_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for user_profiles table
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can update user approval status" ON users;

CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update user approval status" ON users
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- User profiles table policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can view their own user_profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can update their own user_profile" ON user_profiles
FOR ALL USING (auth.uid() = user_id);

-- Pending registrations table policies
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Users can view their own pending registration" ON pending_registrations;

CREATE POLICY "Admins can manage pending registrations" ON pending_registrations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can view their own pending registration" ON pending_registrations
FOR SELECT USING (auth.uid() = user_id);

-- Create notification function for new registrations
CREATE OR REPLACE FUNCTION notify_new_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- You can implement email notification logic here
    -- For now, we'll just log the event
    INSERT INTO system_logs (event_type, description, created_at)
    VALUES (
        'new_registration',
        'New alumni registration from ' || NEW.email,
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If system_logs table doesn't exist, just continue
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new registration notifications
DROP TRIGGER IF EXISTS notify_new_registration_trigger ON pending_registrations;
CREATE TRIGGER notify_new_registration_trigger
    AFTER INSERT ON pending_registrations
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_registration();

-- Sample admin user setup (update the email as needed)
INSERT INTO users (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    is_verified, 
    approval_status,
    registration_date,
    approved_at
) VALUES (
    gen_random_uuid(),
    'paung_230000001724@uic.edu.ph',
    'Admin',
    'User',
    'admin',
    true,
    'approved',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    is_verified = true,
    approval_status = 'approved';

COMMIT;
