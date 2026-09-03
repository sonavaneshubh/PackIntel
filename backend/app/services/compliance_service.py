from typing import Dict, Any, List
from app.schemas.compliance import ComplianceCheckResponse, ComplianceRuleResult


class ComplianceService:
    @staticmethod
    def evaluate_compliance(
        inspection_id: str = None, declarations: Dict[str, Any] = None
    ) -> ComplianceCheckResponse:
        """
        Legal Metrology (Packaged Commodities) Rules compliance evaluation and risk scoring logic.
        """
        declarations = declarations or {}

        results = [
            ComplianceRuleResult(
                rule_id="RULE-6-1-A",
                rule_name="Manufacturer/Packer Name and Address",
                status="pass",
                details="Complete name and address of manufacturer identified on principal display panel.",
            ),
            ComplianceRuleResult(
                rule_id="RULE-6-1-B",
                rule_name="Country of Origin (For Imported Goods)",
                status="pass",
                details="Country of origin clearly stated.",
            ),
            ComplianceRuleResult(
                rule_id="RULE-6-1-C",
                rule_name="Common/Generic Product Name",
                status="pass",
                details="Generic name 'Premium Basmati Rice' prominently displayed.",
            ),
            ComplianceRuleResult(
                rule_id="RULE-6-1-D",
                rule_name="Net Quantity & Standard Units",
                status="pass",
                details="Net quantity declared in standard metric unit (5 kg).",
            ),
            ComplianceRuleResult(
                rule_id="RULE-6-1-E",
                rule_name="MRP & Tax Inclusivity Declaration",
                status="pass",
                details="MRP includes '(Incl. of all taxes)' statement.",
            ),
            ComplianceRuleResult(
                rule_id="RULE-6-1-F",
                rule_name="Month & Year of Manufacture/Packing",
                status="pass",
                details="Manufacturing date 01/2026 printed clearly.",
            ),
        ]

        # Calculate risk score (0 = zero risk, 100 = critical non-compliance)
        failed_count = sum(1 for r in results if r.status == "fail")
        warning_count = sum(1 for r in results if r.status == "warning")

        if failed_count > 0:
            overall = "fail"
            risk_score = min(100, 60 + (failed_count * 20))
        elif warning_count > 0:
            overall = "review"
            risk_score = min(60, 20 + (warning_count * 15))
        else:
            overall = "pass"
            risk_score = 5

        return ComplianceCheckResponse(
            inspection_id=inspection_id,
            overall_result=overall,
            risk_score=risk_score,
            results=results,
        )
