from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.compliance import ComplianceCheckRequest, ComplianceCheckResponse, ComplianceRuleResult
from app.services.compliance_service import ComplianceService
from app.api.dependencies import get_current_user
from app.core.config import settings
from supabase import create_client, Client

router = APIRouter()


def get_supabase_admin() -> Optional[Client]:
    if settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            return create_client(settings.clean_supabase_url, settings.SUPABASE_SERVICE_ROLE_KEY)
        except Exception:
            return None
    return None


@router.post("/compliance/check", response_model=ComplianceCheckResponse)
async def check_compliance(
    request: ComplianceCheckRequest, current_user: dict = Depends(get_current_user)
):
    """
    POST /api/compliance/check
    Runs Legal Metrology compliance checks and saves results to Supabase.
    """
    supabase = get_supabase_admin()

    # Evaluate compliance using existing service
    response = ComplianceService.evaluate_compliance(
        inspection_id=request.inspection_id, declarations=request.declarations
    )

    # Save compliance results to Supabase if configured
    if supabase and request.inspection_id:
        try:
            compliance_records = []
            for rule_result in response.results:
                compliance_records.append({
                    "inspection_id": request.inspection_id,
                    "rule_code": rule_result.rule_id,
                    "rule_name": rule_result.rule_name,
                    "requirement": f"Rule {rule_result.rule_id}",
                    "extracted_value": request.declarations.get(rule_result.rule_id.lower().replace('-', '_'), "") if request.declarations else "",
                    "result": rule_result.status,
                    "explanation": rule_result.details,
                    "evidence": f"OCR extraction for {rule_result.rule_name}",
                    "created_at": datetime.utcnow().isoformat(),
                })

            if compliance_records:
                supabase.table("compliance_results").insert(compliance_records).execute()
        except Exception as e:
            # Log error but don't fail the request
            print(f"Failed to save compliance results: {e}")

    return response


@router.get("/compliance/results/{inspection_id}", response_model=List[ComplianceRuleResult])
async def get_compliance_results(inspection_id: str, current_user: dict = Depends(get_current_user)):
    """
    GET /api/compliance/results/{inspection_id}
    Retrieves compliance results for an inspection from Supabase.
    """
    supabase = get_supabase_admin()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")

    inspector_id = current_user.get("sub")
    if not inspector_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    # Verify inspection belongs to user
    insp_result = supabase.table("inspections").select("id").eq("id", inspection_id).eq("inspector_id", inspector_id).single().execute()
    if insp_result.error:
        raise HTTPException(status_code=404, detail="Inspection not found")

    result = supabase.table("compliance_results").select("*").eq("inspection_id", inspection_id).order("created_at").execute()

    if result.error:
        raise HTTPException(status_code=500, detail=f"Failed to get compliance results: {result.error.message}")

    return result.data or []