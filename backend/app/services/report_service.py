import uuid
from datetime import datetime
from app.schemas.compliance import ReportGenerationResponse


class ReportService:
    @staticmethod
    def generate_inspection_report(
        inspection_id: str, format_type: str = "pdf"
    ) -> ReportGenerationResponse:
        """
        Generates official Legal Metrology inspection report artifact.
        """
        report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"
        download_url = f"/api/reports/download/{report_id}.{format_type}"

        return ReportGenerationResponse(
            report_id=report_id,
            inspection_id=inspection_id,
            download_url=download_url,
            generated_at=datetime.utcnow().isoformat(),
        )
