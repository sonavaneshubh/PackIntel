from typing import Dict, Any, List


class OCRService:
    @staticmethod
    def process_image(image_url: str) -> Dict[str, Any]:
        """
        OCR text extraction and bounding-box detection from product label images.
        
        Requires integration with a vision OCR engine (Tesseract / EasyOCR / Google Cloud Vision / Azure Computer Vision).
        
        Raises:
            NotImplementedError: If no OCR provider is configured.
        """
        raise NotImplementedError(
            "OCR service not configured. Please integrate with a vision OCR engine "
            "(Tesseract, EasyOCR, Google Cloud Vision, Azure Computer Vision, etc.) "
            "and implement the process_image method."
        )


def get_ocr_service() -> OCRService:
    """Factory function to get configured OCR service."""
    return OCRService()