-- PackIntel Database Schema Baseline Migration
-- This migration creates the complete schema with all fixes:
-- 1. Column name alignment with frontend types
-- 2. Missing columns (ocr_text, etc.)
-- 3. RLS policies for all tables
-- 4. Indexes for performance
-- 5. Auth trigger for profiles
-- 6. Storage bucket setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table (aligned with frontend types)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  department TEXT,
  designation TEXT,
  employee_id TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inspections Table (aligned with frontend types)
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_number TEXT UNIQUE NOT NULL,
  inspector_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  product_name TEXT,
  brand_name TEXT,
  manufacturer_name TEXT,
  product_category TEXT,
  is_imported BOOLEAN DEFAULT FALSE,
  overall_result TEXT CHECK (overall_result IN ('pass', 'fail', 'review', 'pending')),
  risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
  notes TEXT,
  inspected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inspection Images Table (with ocr_text column)
CREATE TABLE IF NOT EXISTS public.inspection_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  image_type TEXT DEFAULT 'label_front' CHECK (image_type IN ('label_front', 'label_back', 'label_side', 'product_full', 'evidence_crop')),
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  ocr_text TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extracted Labels Table
CREATE TABLE IF NOT EXISTS public.extracted_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE UNIQUE NOT NULL,
  manufacturer_name TEXT,
  packer_name TEXT,
  importer_name TEXT,
  commodity_name TEXT,
  net_quantity TEXT,
  mrp TEXT,
  month_year_packed TEXT,
  customer_care_details TEXT,
  country_of_origin TEXT,
  other_declarations TEXT,
  raw_ocr_text TEXT,
  extraction_confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Compliance Results Table
CREATE TABLE IF NOT EXISTS public.compliance_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  rule_code TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  requirement TEXT,
  extracted_value TEXT,
  result TEXT CHECK (result IN ('pass', 'fail', 'warning', 'not_applicable')) NOT NULL,
  explanation TEXT,
  evidence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Inspection Reports Table
CREATE TABLE IF NOT EXISTS public.inspection_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES public.inspections(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  report_type TEXT DEFAULT 'pdf',
  file_size_bytes BIGINT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for inspections
DROP POLICY IF EXISTS "Users can view own inspections" ON public.inspections;
CREATE POLICY "Users can view own inspections" ON public.inspections
  FOR SELECT USING (auth.uid() = inspector_id);

DROP POLICY IF EXISTS "Users can insert own inspections" ON public.inspections;
CREATE POLICY "Users can insert own inspections" ON public.inspections
  FOR INSERT WITH CHECK (auth.uid() = inspector_id);

DROP POLICY IF EXISTS "Users can update own inspections" ON public.inspections;
CREATE POLICY "Users can update own inspections" ON public.inspections
  FOR UPDATE USING (auth.uid() = inspector_id);

DROP POLICY IF EXISTS "Users can delete own inspections" ON public.inspections;
CREATE POLICY "Users can delete own inspections" ON public.inspections
  FOR DELETE USING (auth.uid() = inspector_id);

-- RLS Policies for inspection_images
DROP POLICY IF EXISTS "Users can view own inspection images" ON public.inspection_images;
CREATE POLICY "Users can view own inspection images" ON public.inspection_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_images.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own inspection images" ON public.inspection_images;
CREATE POLICY "Users can insert own inspection images" ON public.inspection_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_images.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own inspection images" ON public.inspection_images;
CREATE POLICY "Users can update own inspection images" ON public.inspection_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_images.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own inspection images" ON public.inspection_images;
CREATE POLICY "Users can delete own inspection images" ON public.inspection_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_images.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

-- RLS Policies for extracted_labels
DROP POLICY IF EXISTS "Users can view own extracted labels" ON public.extracted_labels;
CREATE POLICY "Users can view own extracted labels" ON public.extracted_labels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = extracted_labels.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own extracted labels" ON public.extracted_labels;
CREATE POLICY "Users can insert own extracted labels" ON public.extracted_labels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = extracted_labels.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own extracted labels" ON public.extracted_labels;
CREATE POLICY "Users can update own extracted labels" ON public.extracted_labels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = extracted_labels.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

-- RLS Policies for compliance_results
DROP POLICY IF EXISTS "Users can view own compliance results" ON public.compliance_results;
CREATE POLICY "Users can view own compliance results" ON public.compliance_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = compliance_results.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own compliance results" ON public.compliance_results;
CREATE POLICY "Users can insert own compliance results" ON public.compliance_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = compliance_results.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

-- RLS Policies for inspection_reports
DROP POLICY IF EXISTS "Users can view own inspection reports" ON public.inspection_reports;
CREATE POLICY "Users can view own inspection reports" ON public.inspection_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_reports.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own inspection reports" ON public.inspection_reports;
CREATE POLICY "Users can insert own inspection reports" ON public.inspection_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_reports.inspection_id
      AND i.inspector_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON public.inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_overall_result ON public.inspections(overall_result);
CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON public.inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_inspection_number ON public.inspections(inspection_number);

CREATE INDEX IF NOT EXISTS idx_inspection_images_inspection_id ON public.inspection_images(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_images_storage_path ON public.inspection_images(storage_path);

CREATE INDEX IF NOT EXISTS idx_extracted_labels_inspection_id ON public.extracted_labels(inspection_id);

CREATE INDEX IF NOT EXISTS idx_compliance_results_inspection_id ON public.compliance_results(inspection_id);
CREATE INDEX IF NOT EXISTS idx_compliance_results_rule_code ON public.compliance_results(rule_code);

CREATE INDEX IF NOT EXISTS idx_inspection_reports_inspection_id ON public.inspection_reports(inspection_id);

-- Auth trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Compliance Officer'),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  -- Profile already exists, ignore
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inspections_updated_at ON public.inspections;
CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_extracted_labels_updated_at ON public.extracted_labels;
CREATE TRIGGER update_extracted_labels_updated_at
  BEFORE UPDATE ON public.extracted_labels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets (managed via Supabase dashboard or CLI)
-- inspection-images (private)
-- inspection-reports (private)

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.inspections TO authenticated;
GRANT ALL ON public.inspection_images TO authenticated;
GRANT ALL ON public.extracted_labels TO authenticated;
GRANT ALL ON public.compliance_results TO authenticated;
GRANT ALL ON public.inspection_reports TO authenticated;