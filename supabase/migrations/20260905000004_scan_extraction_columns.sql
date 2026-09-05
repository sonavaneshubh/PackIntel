-- 20260905000004_scan_extraction_columns.sql
-- Add columns to persist real OCR confidence, engine, word regions, and the
-- computed compliance score so the frontend never fabricates or recomputes them.

ALTER TABLE public.inspection_images ADD COLUMN IF NOT EXISTS ocr_confidence NUMERIC;
ALTER TABLE public.inspection_images ADD COLUMN IF NOT EXISTS ocr_engine TEXT;
ALTER TABLE public.inspection_images ADD COLUMN IF NOT EXISTS ocr_regions JSONB;

ALTER TABLE public.extracted_labels ADD COLUMN IF NOT EXISTS ocr_confidence NUMERIC;

ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS compliance_score INT CHECK (compliance_score BETWEEN 0 AND 100);