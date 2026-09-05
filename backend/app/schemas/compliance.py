from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ComplianceCheckRequest(BaseModel):
    inspection_id: Optional[str] = None
    declarations: Optional[Dict[str, Any]] = None
    product_information: Optional[Dict[str, Any]] = None


class ComplianceRuleResult(BaseModel):
    rule_id: str
    rule_name: str
    status: str  # pass, fail, warning
    details: str


class ComplianceResult(BaseModel):
    """A compliance rule result aligned with the compliance_results table columns."""

    rule_code: str
    rule_name: str
    result: str  # pass, fail, warning, not_applicable
    extracted_value: Optional[str] = None
    explanation: str
    evidence: Optional[str] = None
    requirement: Optional[str] = None


class ComplianceCheckResponse(BaseModel):
    inspection_id: Optional[str] = None
    overall_result: str  # pass, review, fail
    risk_score: int = 0
    compliance_score: int = 0
    results: List[ComplianceResult] = []


class ReportGenerationRequest(BaseModel):
    inspection_id: str
    format: Optional[str] = "pdf"


class ReportGenerationResponse(BaseModel):
    report_id: str
    inspection_id: str
    download_url: str
    generated_at: str
