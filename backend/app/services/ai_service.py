import re
from typing import Dict, Any


class AIService:
    @staticmethod
    def extract_declarations(raw_text: str) -> Dict[str, Any]:
        """
        AI extraction service mapping OCR output into structured Legal Metrology declaration fields.
        Uses regex & NLP pattern extraction.
        """
        text = raw_text or ""

        # Default dictionary
        declarations = {
            "manufacturer_name": None,
            "packer_name": None,
            "importer_name": None,
            "commodity_name": None,
            "common_generic_name": None,
            "net_quantity": None,
            "mrp": None,
            "mfg_date": None,
            "month_year_packed": None,
            "consumer_care": None,
            "customer_care_details": None,
            "country_of_origin": None,
            "other_declarations": None,
        }

        # 1. Manufacturer / Packer
        mfg_match = re.search(
            r"(?:manufacturer|manufactured\s+by|packed\s+by|packer)\s*[:\.-]?\s*([^\n\r,]+(?:,[^\n\r]+){0,2})",
            text, re.IGNORECASE
        )
        if mfg_match:
            declarations["manufacturer_name"] = mfg_match.group(1).strip()
            declarations["packer_name"] = mfg_match.group(1).strip()

        # 2. Net Quantity
        qty_match = re.search(
            r"(?:net\s*qty|net\s*quantity|net\s*wt|quantity)\s*[:\.-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:kg|g|gm|l|ml|pcs|units|n))\b",
            text, re.IGNORECASE
        )
        if qty_match:
            declarations["net_quantity"] = qty_match.group(1).strip()

        # 3. MRP
        mrp_match = re.search(
            r"(?:mrp|max\s*retail\s*price|price)\s*[:\.-]?\s*(?:rs\.?|₹)?\s*([0-9]+(?:\.[0-9]{2})?)",
            text, re.IGNORECASE
        )
        if mrp_match:
            declarations["mrp"] = f"Rs. {mrp_match.group(1).strip()}"
            if "incl" in text.lower() or "taxes" in text.lower():
                declarations["mrp"] += " (Incl. of all taxes)"

        # 4. Mfg / Packed Date
        date_match = re.search(
            r"(?:mfd|mfg|packed|pkd|date)\s*[:\.-]?\s*([0-9]{1,2}[/-][0-9]{2,4}|[a-z]{3}\s*[0-9]{2,4})",
            text, re.IGNORECASE
        )
        if date_match:
            declarations["mfg_date"] = date_match.group(1).strip()
            declarations["month_year_packed"] = date_match.group(1).strip()

        # 5. Product / Commodity Name
        prod_match = re.search(
            r"(?:product|commodity|name)\s*[:\.-]?\s*([^\n\r]+)",
            text, re.IGNORECASE
        )
        if prod_match:
            declarations["commodity_name"] = prod_match.group(1).strip()
            declarations["common_generic_name"] = prod_match.group(1).strip()

        # 6. Country of Origin
        country_match = re.search(
            r"(?:country\s*of\s*origin|made\s*in|origin)\s*[:\.-]?\s*([a-zA-Z]+)",
            text, re.IGNORECASE
        )
        if country_match:
            declarations["country_of_origin"] = country_match.group(1).strip()

        # 7. Customer / Consumer Care
        care_match = re.search(
            r"(?:consumer\s*care|customer\s*care|care|contact)\s*[:\.-]?\s*([^\n\r]+)",
            text, re.IGNORECASE
        )
        if care_match:
            declarations["consumer_care"] = care_match.group(1).strip()
            declarations["customer_care_details"] = care_match.group(1).strip()

        return declarations


def get_ai_service() -> AIService:
    """Factory function to get configured AI service."""
    return AIService()