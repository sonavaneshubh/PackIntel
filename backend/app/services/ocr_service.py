import io
import os
import base64
import logging
import shutil
from typing import Dict, Any
import urllib.request
from PIL import Image, ImageEnhance

logger = logging.getLogger(__name__)

try:
    import pytesseract
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False


def _resolve_tesseract_command() -> str | None:
    """Resolve an optional configured command or the platform PATH entry."""
    configured_command = os.getenv("TESSERACT_CMD", "").strip()
    if configured_command:
        return shutil.which(configured_command) or (
            configured_command if os.path.isfile(configured_command) else None
        )
    return shutil.which("tesseract")


class OCRService:
    @staticmethod
    def _fetch_image(image_input: str) -> Image.Image:
        """Fetches PIL Image from URL, data URI, or local file path."""
        if not image_input or not isinstance(image_input, str):
            raise ValueError("No image URL or path provided")

        image_input = image_input.strip()

        # Handle data URI (data:image/png;base64,...)
        if image_input.startswith("data:image"):
            header, base64_data = image_input.split(",", 1)
            image_bytes = base64.b64decode(base64_data)
            return Image.open(io.BytesIO(image_bytes))

        # Handle HTTP / HTTPS URL
        if image_input.startswith("http://") or image_input.startswith("https://"):
            req = urllib.request.Request(
                image_input,
                headers={"User-Agent": "PackIntel-OCR-Scanner/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                image_bytes = response.read()
            return Image.open(io.BytesIO(image_bytes))

        # Handle local file path
        if os.path.exists(image_input):
            return Image.open(image_input)

        raise ValueError(f"Could not load image from input: {image_input[:50]}")

    @staticmethod
    def _preprocess_image(image: Image.Image) -> Image.Image:
        """Preprocesses image for optimal OCR extraction."""
        # Convert to RGB if palette/RGBA
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Resize if too small for clear text detection
        w, h = image.size
        if w < 600 or h < 600:
            scale = max(600 / w, 600 / h)
            image = image.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)
        return image

    @classmethod
    def process_image(cls, image_url: str) -> Dict[str, Any]:
        """
        OCR text extraction from product label images.
        """
        if not image_url:
            raise ValueError("Image URL is required for OCR scanning.")

        tesseract_command = _resolve_tesseract_command()
        if not HAS_PYTESSERACT:
            raise RuntimeError("pytesseract is not installed")
        if not tesseract_command:
            raise RuntimeError(
                "Tesseract OCR is not installed or not available in PATH. "
                "Install Tesseract or set TESSERACT_CMD to its executable."
            )

        pytesseract.pytesseract.tesseract_cmd = tesseract_command

        try:
            pil_img = cls._fetch_image(image_url)
            processed_img = cls._preprocess_image(pil_img)
            ocr_text = pytesseract.image_to_string(processed_img).strip()
        except Exception as err:
            logger.exception("OCR processing failed")
            raise RuntimeError(f"OCR processing failed: {err}") from err

        if not ocr_text:
            raise RuntimeError("OCR returned no text for the supplied image")

        confidence = 85.0
        engine_used = "tesseract"

        lines = [line.strip() for line in ocr_text.splitlines() if line.strip()]

        return {
            "status": "success",
            "text": ocr_text,
            "raw_text": ocr_text,
            "confidence": confidence,
            "engine": engine_used,
            "lines": lines,
        }

def get_ocr_service() -> OCRService:
    """Factory function to get configured OCR service."""
    return OCRService()