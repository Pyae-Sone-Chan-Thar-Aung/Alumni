-- ============================================================================
-- Add Speaker Fields to Professional Development Events Table
-- ============================================================================
-- This migration adds speaker_name and speaker_bio columns to the 
-- professional_development_events table for quick event speaker reference
-- ============================================================================

BEGIN;

-- Add speaker_name column
ALTER TABLE public.professional_development_events 
ADD COLUMN IF NOT EXISTS speaker_name TEXT;

-- Add speaker_bio column
ALTER TABLE public.professional_development_events 
ADD COLUMN IF NOT EXISTS speaker_bio TEXT;

-- Add comment to explain these fields
COMMENT ON COLUMN public.professional_development_events.speaker_name IS 'Primary speaker or facilitator name for quick reference';
COMMENT ON COLUMN public.professional_development_events.speaker_bio IS 'Brief biography or credentials of the primary speaker';

COMMIT;

-- ============================================================================
-- Migration complete!
-- Note: These fields are optional and for convenience. For detailed speaker
-- management with multiple speakers, use the event_speakers table.
-- ============================================================================
