from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ComplianceCheckRequest(BaseModel):
    inspection_id: Optional[str] = None
    declarations: Optional[Dict[str, Any]] = None


class ComplianceRuleResult(BaseModel):
    rule_id: str
    rule_name: str
    status: str  # pass, fail, warning
    details: str


class ComplianceCheckResponse(BaseModel):
    inspection_id: Optional[str] = None
    overall_result: str  # pass, review, fail
    risk_score: int
    results: List[ComplianceRuleResult]


class ReportGenerationRequest(BaseModel):
    inspection_id: str
    format: Optional[str] = "pdf"


class ReportGenerationResponse(BaseModel):
    report_id: str
    inspection_id: str
    download_url: str
    generated_at: str
