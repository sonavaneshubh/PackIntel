from typing import Dict, Any, List


class OCRService:
    @staticmethod
    def process_image(image_url: str) -> Dict[str, Any]:
        """
        Simulates OCR text extraction and bounding-box detection from product label images.
        Integrates with vision OCR engines (Tesseract / EasyOCR / Cloud Vision).
        """
        return {
            "raw_text": "NET QUANTITY: 5 kg\nMRP: Rs. 450.00 (Incl. of all taxes)\nMFG DATE: 01/2026\nPACKED BY: ABC Foods Pvt. Ltd., Industrial Area Phase-2, New Delhi\nFSSAI LIC NO: 10020011000123\nGENERIC NAME: Premium Basmati Rice",
            "bounding_boxes": [
                {"id": "bb-1", "label": "MRP", "box": [120, 340, 280, 50]},
                {"id": "bb-2", "label": "Net Quantity", "box": [120, 260, 220, 45]},
                {"id": "bb-3", "label": "Manufacturer Address", "box": [120, 420, 450, 60]},
                {"id": "bb-4", "label": "Mfg Date", "box": [120, 500, 200, 40]},
                {"id": "bb-5", "label": "FSSAI License", "box": [120, 560, 320, 40]},
            ],
            "confidence_score": 98.4,
        }
