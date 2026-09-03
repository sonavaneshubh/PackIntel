from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import scan, inspection, compliance, reports

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Enable CORS for frontend development URL
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(scan.router, prefix=settings.API_V1_STR, tags=["scan"])
app.include_router(inspection.router, prefix=settings.API_V1_STR, tags=["inspection"])
app.include_router(compliance.router, prefix=settings.API_V1_STR, tags=["compliance"])
app.include_router(reports.router, prefix=settings.API_V1_STR, tags=["reports"])


@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint for service monitoring.
    """
    return {"status": "ok"}
