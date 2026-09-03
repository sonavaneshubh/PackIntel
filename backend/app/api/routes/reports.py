from fastapi import APIRouter, Depends
from app.schemas.compliance import ReportGenerationRequest, ReportGenerationResponse
from app.services.report_service import ReportService
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/reports/generate", response_model=ReportGenerationResponse)
async def generate_report(
    request: ReportGenerationRequest, current_user: dict = Depends(get_current_user)
):
    """
    POST /api/reports/generate
    Generates downloadable compliance PDF/JSON report.
    """
    return ReportService.generate_inspection_report(
        inspection_id=request.inspection_id, format_type=request.format or "pdf"
    )
