-- =============================================================================
-- UIC Alumni Portal - Storage Buckets Creation Script
-- Creates the required storage buckets for the application
-- =============================================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('alumni-profiles', 'alumni-profiles', true),
  ('gallery-images', 'gallery-images', true),
  ('news-images', 'news-images', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Verify the buckets were created
SELECT 
  id, 
  name, 
  public, 
  created_at 
FROM storage.buckets 
WHERE id IN ('alumni-profiles', 'gallery-images', 'news-images', 'documents')
ORDER BY name;