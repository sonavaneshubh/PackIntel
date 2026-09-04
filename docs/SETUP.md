# PackIntel Local Setup Guide

Follow these steps to run the frontend and backend applications locally.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Git
- Tesseract OCR 5+ installed and available in PATH

On Windows, install Tesseract and either add it to PATH or set `TESSERACT_CMD` in
`backend/.env` to the executable path. The backend also detects the standard
`C:\\Program Files\\Tesseract-OCR\\tesseract.exe` installation automatically.
You can install it with Windows Package Manager:

```powershell
winget install --id UB-Mannheim.TesseractOCR --accept-package-agreements --accept-source-agreements
```

On Render, the included `render.yaml`
installs the Linux `tesseract-ocr` package during the build, so `TESSERACT_CMD`
should remain unset.

## 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`.

## 2. Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate # Linux/macOS

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend will run on `http://localhost:8000`.
Open `http://localhost:8000/docs` for API documentation.

## Render deployment

Create the backend service from `render.yaml` or set these Render environment
variables manually:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase service-role key
- `FRONTEND_URL`: deployed Vercel URL, including the `https://` scheme

The Render build command must install `tesseract-ocr` before `pip install -r
requirements.txt`. Do not set a Windows `TESSERACT_CMD` value on Render.
