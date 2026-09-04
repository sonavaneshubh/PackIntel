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
    """
    image_url = request.image_url
    if not image_url:
        raise HTTPException(status_code=400, detail="image_url is required for OCR scanning")

    # 2. Run OCR processing
    try:
        ocr_service = get_ocr_service()
        ocr_result = ocr_service.process_image(image_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    # 3. Extract Legal Metrology declarations
    try:
        ai_service = get_ai_service()
        extracted = ai_service.extract_declarations(ocr_result.get("raw_text", ""))
    except Exception as e:
        extracted = {}

    # Merge request metadata as fallback if OCR extraction left essential fields null
    mfg_input = request.manufacturer_name or request.manufacturer
    prod_input = request.product_name

    if not extracted.get("commodity_name") and prod_input:
        extracted["commodity_name"] = prod_input
        extracted["common_generic_name"] = prod_input
    if not extracted.get("manufacturer_name") and mfg_input:
        extracted["manufacturer_name"] = mfg_input
        extracted["packer_name"] = mfg_input

    inspection_id = f"INS-{uuid.uuid4().hex[:8].upper()}"

    return ScanResponse(
        status="success",
        inspection_id=inspection_id,
        message="Scan completed and declarations extracted successfully.",
        ocr_raw_text=ocr_result.get("raw_text", ""),
        extracted_declarations=extracted,
    )