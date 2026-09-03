-- Storage buckets for PackIntel
-- Run this in Supabase SQL Editor or via CLI

-- Create inspection-images bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-images',
  'inspection-images',
  false,
  52428800,  -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create inspection-reports bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-reports',
  'inspection-reports',
  false,
  104857600,  -- 100MB
  ARRAY['application/pdf', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policies for inspection-images bucket
-- Users can upload to their own folder: {user_id}/{inspection_id}/*
CREATE POLICY "Users can upload own inspection images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own inspection images
CREATE POLICY "Users can view own inspection images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own inspection images
CREATE POLICY "Users can update own inspection images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'inspection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own inspection images
CREATE POLICY "Users can delete own inspection images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inspection-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for inspection-reports bucket
CREATE POLICY "Users can upload own inspection reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspection-reports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own inspection reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspection-reports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own inspection reports"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'inspection-reports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own inspection reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inspection-reports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);