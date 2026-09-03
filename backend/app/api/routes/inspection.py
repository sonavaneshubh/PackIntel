import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.inspection import InspectionCreate, InspectionResponse
from app.api.dependencies import get_current_user

router = APIRouter()

# In-memory store fallback if Supabase DB is disconnected
MOCK_INSPECTIONS = [
    {
        "id": "ins-101",
        "inspection_number": "INS-20260903-1001",
        "product_name": "Premium Basmati Rice 5 kg",
        "category": "food",
        "manufacturer": "ABC Foods Pvt. Ltd.",
        "is_imported": False,
        "status": "completed",
        "overall_result": "pass",
        "risk_score": 5,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "id": "ins-102",
        "inspection_number": "INS-20260903-1002",
        "product_name": "Organic Almonds 500g",
        "category": "food",
        "manufacturer": "NutriHealth Organics",
        "is_imported": True,
        "status": "completed",
        "overall_result": "review",
        "risk_score": 35,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
]


@router.post("/inspection", response_model=InspectionResponse)
async def create_inspection(
    request: InspectionCreate, current_user: dict = Depends(get_current_user)
):
    """
    POST /api/inspection
    Creates a new inspection record.
    """
    inspection_id = f"ins-{uuid.uuid4().hex[:6]}"
    inspection_number = f"INS-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

    record = {
        "id": inspection_id,
        "inspection_number": inspection_number,
        "product_name": request.product_name,
        "category": request.category,
        "manufacturer": request.manufacturer,
        "is_imported": request.is_imported,
        "status": "draft",
        "overall_result": None,
        "risk_score": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    MOCK_INSPECTIONS.insert(0, record)
    return record


@router.get("/inspections", response_model=List[InspectionResponse])
async def list_inspections(current_user: dict = Depends(get_current_user)):
    """
    GET /api/inspections
    Lists user's inspection history.
    """
    return MOCK_INSPECTIONS


@router.get("/inspection/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(inspection_id: str, current_user: dict = Depends(get_current_user)):
    """
    GET /api/inspection/{inspection_id}
    Retrieves details for a specific inspection.
    """
    for item in MOCK_INSPECTIONS:
        if item["id"] == inspection_id or item["inspection_number"] == inspection_id:
            return item
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection record not found")
