-- 20260905000005_product_information.sql
-- Persist the canonical structured product-information schema (Phase 2).
-- The object is extensible (JSONB) and backward compatible: existing rows keep
-- their legacy columns untouched.
--
-- Shape stored per field:
--   {
--     "brand_or_commodity_name": {"value": "...", "status": "detected",
--                                  "confidence": 94.2, "source": "ocr"},
--     ...
--   }

ALTER TABLE public.extracted_labels
  ADD COLUMN IF NOT EXISTS product_information JSONB;