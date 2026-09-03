import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.inspection import ScanRequest, ScanResponse
from app.services.ocr_service import OCRService, get_ocr_service
from app.services.ai_service import AIService, get_ai_service
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/scan", response_model=ScanResponse)
async def create_scan(request: ScanRequest, current_user: dict = Depends(get_current_user)):
    """
    POST /api/scan
    Receives image/product payload, executes OCR processing and declaration extraction.
    
    Requires OCR and AI services to be configured.
    """
    try:
        ocr_service = get_ocr_service()
        ocr_result = ocr_service.process_image(request.image_url or "")
    except NotImplementedError as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"OCR service not available: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}"
        )

    try:
        ai_service = get_ai_service()
        extracted = ai_service.extract_declarations(ocr_result.get("raw_text", ""))
    except NotImplementedError as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"AI extraction service not available: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI extraction failed: {str(e)}"
        )

    inspection_id = f"INS-{uuid.uuid4().hex[:8].upper()}"

    return ScanResponse(
        status="success",
        inspection_id=inspection_id,
        message="Scan completed and declarations extracted.",
        ocr_raw_text=ocr_result.get("raw_text", ""),
        extracted_declarations=extracted,
    )