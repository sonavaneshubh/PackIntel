# Supabase Database & Auth Configuration

This directory contains Supabase database schemas, RLS policy definitions, and configuration files for PackIntel.

## Existing Tables

1. `profiles`
2. `inspections`
3. `inspection_images`
4. `extracted_labels`
5. `compliance_results`
6. `inspection_reports`

## Database Management Rules

- Database changes should be managed exclusively within `supabase/`.
- Do not recreate or delete existing tables.
- RLS policies restrict row access to authenticated inspectors.
