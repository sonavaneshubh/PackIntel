# PackIntel Backend API

Python FastAPI backend for PackIntel (Legal Metrology Compliance & AI Inspection Platform).

## Backend Responsibilities

- **OCR processing**: Preprocessing and text extraction from packaged product label images.
- **AI extraction**: Entity recognition and declaration parsing according to Legal Metrology standards.
- **Legal Metrology compliance checking**: Automated rule evaluation (Rule 6(1) a-f) and risk scoring.
- **Report generation**: Exporting inspection reports in PDF and JSON formats.
- **REST API endpoints**: `POST /api/scan`, `POST /api/inspection`, `GET /api/inspections`, `GET /api/inspection/{id}`, `POST /api/compliance/check`, `POST /api/reports/generate`, `GET /health`.

## Getting Started

### 1. Create Virtual Environment
```bash
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Setup
Copy `.env` and fill in secrets:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
FRONTEND_URL=http://localhost:3000
TESSERACT_CMD=C:\\Program Files\\Tesseract-OCR\\tesseract.exe
```

`TESSERACT_CMD` is optional. The backend resolves Tesseract from PATH when it is
available, and also detects the standard Windows installation path.

### 4. Run Server
```bash
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`
