import uuid
from fastapi import APIRouter, Depends
from app.schemas.inspection import ScanRequest, ScanResponse
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/scan", response_model=ScanResponse)
async def create_scan(request: ScanRequest, current_user: dict = Depends(get_current_user)):
    """
    POST /api/scan
    Receives image/product payload, executes OCR processing and declaration extraction.
    """
    inspection_id = f"INS-{uuid.uuid4().hex[:8].upper()}"
    ocr_result = OCRService.process_image(request.image_url or "")
    extracted = AIService.extract_declarations(ocr_result["raw_text"])

    return ScanResponse(
        status="success",
        inspection_id=inspection_id,
        message="Scan completed and declarations extracted.",
        ocr_raw_text=ocr_result["raw_text"],
        extracted_declarations=extracted,
    )
