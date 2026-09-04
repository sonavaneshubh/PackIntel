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

    # 2. Run OCR processing. Expected image/OCR quality problems are completed
    # with a warning by OCRService; only invalid input remains a client error.
    try:
        ocr_service = get_ocr_service()
        ocr_result = ocr_service.process_image(image_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # 3. Extract Legal Metrology declarations
    ocr_text = ocr_result.get("raw_text", "")
    ai_service = get_ai_service()
    extracted = ai_service.extract_declarations(ocr_text)

    # Merge request metadata as fallback if OCR extraction left essential fields null.
    mfg_input = request.manufacturer_name or request.manufacturer
    prod_input = request.product_name

    if ocr_text and not extracted.get("commodity_name") and prod_input:
        extracted["commodity_name"] = prod_input
        extracted["common_generic_name"] = prod_input
    if ocr_text and not extracted.get("manufacturer_name") and mfg_input:
        extracted["manufacturer_name"] = mfg_input
        extracted["packer_name"] = mfg_input

    inspection_id = f"INS-{uuid.uuid4().hex[:8].upper()}"
    quality_reason = ocr_result.get("quality_reason")
    unusable_quality = ocr_result.get("image_quality") in {"poor", "unusable"}
    extracted_values = [value for value in extracted.values() if value]
    has_information = bool(ocr_text.strip()) and bool(extracted_values) and not unusable_quality
    score = min(100, len(extracted_values) * 15) if has_information else 0
    if not has_information:
        result_status = "insufficient_information"
        report = (
            f"{quality_reason.rstrip('.')}. No readable package-label information was detected. "
            "Upload a clearer image."
            if quality_reason
            else "No readable package-label information was detected. Upload a clearer image."
        )
        message = f"Scan completed. {report}"
    elif score < 90:
        result_status = "partial_information"
        report = quality_reason or "Some package information could not be verified from the image."
        message = f"Scan completed with partial information. {report}"
    else:
        result_status = "success"
        report = quality_reason
        message = "Scan completed and declarations extracted successfully."

    return ScanResponse(
        status=result_status,
        success=True,
        scan_completed=True,
        inspection_id=inspection_id,
        message=message,
        ocr_raw_text=ocr_text,
        extracted_declarations=extracted,
        score=score,
        compliance_score=score,
        image_quality=ocr_result.get("image_quality", "unknown"),
        quality_reason=quality_reason,
        report=report,
    )