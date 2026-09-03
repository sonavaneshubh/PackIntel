from fastapi import APIRouter, Depends
from app.schemas.compliance import ComplianceCheckRequest, ComplianceCheckResponse
from app.services.compliance_service import ComplianceService
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/compliance/check", response_model=ComplianceCheckResponse)
async def check_compliance(
    request: ComplianceCheckRequest, current_user: dict = Depends(get_current_user)
):
    """
    POST /api/compliance/check
    Runs Legal Metrology compliance checks and generates risk scores.
    """
    return ComplianceService.evaluate_compliance(
        inspection_id=request.inspection_id, declarations=request.declarations
    )
