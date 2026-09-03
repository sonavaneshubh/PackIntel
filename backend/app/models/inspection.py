from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any


@dataclass
class InspectionModel:
    id: str
    inspection_number: str
    inspector_id: str
    product_name: str
    category: str
    manufacturer: str
    is_imported: bool
    status: str = "draft"
    overall_result: Optional[str] = None
    risk_score: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
