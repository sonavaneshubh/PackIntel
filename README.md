# PackIntel SIH 2026

PackIntel is an AI-powered Legal Metrology Compliance and Inspection platform designed for Packaged Commodities verification.

## Architecture

```
PackIntel/
│
├── frontend/             # Next.js 15, React 19, TypeScript, Tailwind CSS
├── backend/              # Python FastAPI, OCR, AI Extraction, Compliance Engine
├── supabase/             # Database migrations, RLS policies, schemas
├── docs/                 # Platform architecture, API specs, setup guide
├── .gitignore            # Root gitignore rules
└── README.md             # Top-level workspace documentation
```

## Quick Start

### 1. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend development server: [http://localhost:3000](http://localhost:3000)

### 2. Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

Backend development server: [http://localhost:5000](http://localhost:5000)
API Interactive Documentation: [http://localhost:5000/docs](http://localhost:5000/docs)
Health Check: [http://localhost:5000/health](http://localhost:5000/health)

## Environment Variables

### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`backend/.env`):
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
FRONTEND_URL=http://localhost:3000
```

> **IMPORTANT**: `SUPABASE_SERVICE_ROLE_KEY` must ONLY exist in `backend/.env` and must NEVER be exposed to client/browser code.

## REST API Endpoints

- `GET /health`: Health status check
- `POST /api/scan`: Execute OCR processing & AI declaration extraction
- `POST /api/inspection`: Create new inspection record
- `GET /api/inspections`: Retrieve inspection history
- `GET /api/inspection/{inspection_id}`: Fetch detailed inspection data
- `POST /api/compliance/check`: Legal Metrology rule compliance check & risk score
- `POST /api/reports/generate`: Generate downloadable inspection report (PDF/JSON)

## Team Development Boundaries

- **Frontend Engineers**: Work primarily inside `frontend/`
- **Backend Engineers**: Work primarily inside `backend/`
- **Database Schema Owners**: Manage migrations inside `supabase/`
- **Documentation**: Maintain architectural and API guides inside `docs/`
