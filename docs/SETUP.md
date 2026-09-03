# PackIntel Local Setup Guide

Follow these steps to run the frontend and backend applications locally.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Git

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
