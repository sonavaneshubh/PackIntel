from typing import Dict, Any


class AIService:
    @staticmethod
    def extract_declarations(raw_text: str) -> Dict[str, Any]:
        """
        AI extraction service mapping OCR output into structured Legal Metrology declaration fields.
        """
        return {
            "manufacturer_name": "ABC Foods Pvt. Ltd.",
            "manufacturer_address": "Industrial Area Phase-2, New Delhi",
            "country_of_origin": "India",
            "common_generic_name": "Premium Basmati Rice",
            "net_quantity": "5 kg",
            "mrp": "Rs. 450.00",
            "mfg_date": "01/2026",
            "consumer_care": "care@abcfoods.com, 1800-123-4567",
        }
