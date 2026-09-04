-- Ensure the production storage bucket and its user-scoped policies exist.
-- Run this migration against the same Supabase project used by the frontend.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-images',
  'inspection-images',
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users can upload own inspection images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own inspection images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own inspection images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own inspection images" ON storage.objects;

CREATE POLICY "Users can upload own inspection images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own inspection images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own inspection images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'inspection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own inspection images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inspection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);