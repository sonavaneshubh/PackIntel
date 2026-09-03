from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any


@dataclass
class ComplianceRule:
    rule_id: str
    rule_name: str
    legal_act_reference: str
    description: str


@dataclass
class ComplianceEvaluation:
    inspection_id: str
    overall_result: str
    risk_score: int
    rule_results: List[Dict[str, Any]]
    evaluated_at: datetime = field(default_factory=datetime.utcnow)
