from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ScanRequest(BaseModel):
    image_url: Optional[str] = None
    product_name: Optional[str] = None
    brand_name: Optional[str] = None
    manufacturer: Optional[str] = None
    manufacturer_name: Optional[str] = None
    category: Optional[str] = None
    product_category: Optional[str] = None
    is_imported: Optional[bool] = False


class ScanResponse(BaseModel):
    status: str = "success"
    inspection_id: str
    message: str = "Scan processing started successfully."
    ocr_raw_text: Optional[str] = None
    extracted_declarations: Optional[Dict[str, Any]] = None


class InspectionCreate(BaseModel):
    product_name: str
    category: str
    manufacturer: str
    is_imported: bool = False
    image_url: Optional[str] = None


class InspectionResponse(BaseModel):
    id: str
    inspection_number: str
    product_name: str
    category: str
    manufacturer: str
    is_imported: bool
    status: str
    overall_result: Optional[str] = None
    risk_score: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
