-- ===================================================================
-- FIX PENDING_REGISTRATIONS TABLE - ADD MISSING COLUMNS
-- ===================================================================
-- This script adds all missing columns to the pending_registrations table
-- ===================================================================

-- Add all potentially missing columns to pending_registrations
DO $$
BEGIN
    -- Add user_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.pending_registrations 
        ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Add email if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN email TEXT;
    END IF;

    -- Add first_name if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN first_name TEXT;
    END IF;

    -- Add last_name if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN last_name TEXT;
    END IF;

    -- Add student_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'student_id'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN student_id TEXT;
    END IF;

    -- Add phone if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN phone TEXT;
    END IF;

    -- Add program if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'program'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN program TEXT;
    END IF;

    -- Add course if missing (some schemas use 'course' instead of 'program')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'course'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN course TEXT;
    END IF;

    -- Add batch_year if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'batch_year'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN batch_year TEXT;
    END IF;

    -- Add graduation_year if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'graduation_year'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN graduation_year TEXT;
    END IF;

    -- Add address if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN address TEXT;
    END IF;

    -- Add city if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN city TEXT;
    END IF;

    -- Add country if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN country TEXT DEFAULT 'Philippines';
    END IF;

    -- Add current_job if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'current_job'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN current_job TEXT;
    END IF;

    -- Add company if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'company'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN company TEXT;
    END IF;

    -- Add profile_image_url if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'profile_image_url'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN profile_image_url TEXT;
    END IF;

    -- Add status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.pending_registrations 
        ADD COLUMN status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;

    -- Add submitted_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'submitted_at'
    ) THEN
        ALTER TABLE public.pending_registrations 
        ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add processed_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'processed_at'
    ) THEN
        ALTER TABLE public.pending_registrations 
        ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add processed_by if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'processed_by'
    ) THEN
        ALTER TABLE public.pending_registrations 
        ADD COLUMN processed_by UUID REFERENCES public.users(id);
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.pending_registrations ADD COLUMN notes TEXT;
    END IF;

END $$;

-- Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pending_registrations_user_id_key'
    ) THEN
        ALTER TABLE public.pending_registrations 
        ADD CONSTRAINT pending_registrations_user_id_key UNIQUE (user_id);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN others THEN NULL;
END $$;

-- Verify all columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'pending_registrations'
ORDER BY ordinal_position;

-- ===================================================================
-- COMPLETED!
-- ===================================================================
-- All columns should now be present in pending_registrations table
-- ===================================================================
