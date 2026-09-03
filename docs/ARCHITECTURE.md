# PackIntel Monorepo Architecture

## Repository Structure Overview

```
PackIntel/
│
├── frontend/             # Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
├── backend/              # Python FastAPI, OCR Engine, AI Extractor, Compliance Evaluator
├── supabase/             # Database DDL, RLS policies, storage bucket configs
├── docs/                 # Platform architecture, API specs, developer setup guide
├── .gitignore            # Monorepo-wide git exclusion rules
└── README.md             # Top-level workspace introduction & run instructions
```

## System Components

1. **Frontend (`frontend/`)**:
   - Single-page & multi-page navigation for Inspector Dashboard, Image Upload / Scan UI, Inspection Details, Results, and Report Download.
   - Client-side Supabase Auth integration (Login, Logout, Session management).
   - Consumes backend REST API endpoints (`http://localhost:8000`).

2. **Backend (`backend/`)**:
   - Built on Python 3.10+ and FastAPI.
   - Provides OCR text extraction, NLP Legal Metrology entity extraction, risk score evaluation, and report PDF generation.
   - Accesses Supabase Database & Storage securely via `SUPABASE_SERVICE_ROLE_KEY`.

3. **Supabase Cloud Service**:
   - Manages user identity (Auth).
   - PostgreSQL persistence layer storing inspection records, extracted metadata, and compliance results.
   - Storage buckets: `inspection-images` and `inspection-reports`.
