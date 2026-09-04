import io
import os
import base64
import logging
import shutil
from typing import Dict, Any
import urllib.request
from PIL import Image, ImageEnhance, ImageFilter, ImageStat
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    import pytesseract
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False


def _resolve_tesseract_command() -> str | None:
    """Resolve an optional configured command or the platform PATH entry."""
    configured_command = (
        os.getenv("TESSERACT_CMD", "").strip()
        or settings.TESSERACT_CMD.strip()
    )
    if configured_command:
        return shutil.which(configured_command) or (
            configured_command if os.path.isfile(configured_command) else None
        )

    path_command = shutil.which("tesseract")
    if path_command:
        return path_command

    if os.name == "nt":
        for candidate in (
            os.path.join(os.environ.get("ProgramFiles", ""), "Tesseract-OCR", "tesseract.exe"),
            os.path.join(os.environ.get("ProgramFiles(x86)", ""), "Tesseract-OCR", "tesseract.exe"),
        ):
            if os.path.isfile(candidate):
                return candidate

    return None


def get_tesseract_diagnostics() -> Dict[str, Any]:
    """Return a safe status describing the Python wrapper and native OCR binary."""
    if not HAS_PYTESSERACT:
        return {
            "available": False,
            "reason": "pytesseract_missing",
            "message": "pytesseract is not installed",
        }

    configured_command = (
        os.getenv("TESSERACT_CMD", "").strip()
        or settings.TESSERACT_CMD.strip()
    )
    tesseract_command = _resolve_tesseract_command()
    if not tesseract_command:
        if configured_command:
            return {
                "available": False,
                "reason": "tesseract_inaccessible",
                "message": "TESSERACT_CMD is configured but the executable cannot be found.",
            }
        return {
            "available": False,
            "reason": "tesseract_missing",
            "message": (
                "Tesseract OCR is not installed or not available in PATH. "
                "Install Tesseract or set TESSERACT_CMD to its executable."
            ),
        }

    pytesseract.pytesseract.tesseract_cmd = tesseract_command
    try:
        version = str(pytesseract.get_tesseract_version()).strip()
    except Exception:
        return {
            "available": False,
            "reason": "tesseract_inaccessible",
            "message": "Tesseract OCR is configured but cannot be executed.",
        }

    return {
        "available": True,
        "reason": "ok",
        "message": "Tesseract OCR is available",
        "version": version,
    }


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

    @staticmethod
    def _analyze_image_quality(image: Image.Image) -> Dict[str, Any]:
        """Classify obvious image-quality problems before OCR is attempted."""
        grayscale = image.convert("L")
        width, height = image.size
        stats = ImageStat.Stat(grayscale)
        brightness = stats.mean[0]
        contrast = stats.stddev[0]
        edge_stats = ImageStat.Stat(grayscale.filter(ImageFilter.FIND_EDGES))
        sharpness = edge_stats.stddev[0]

        reasons = []
        if width < 200 or height < 200:
            reasons.append("image resolution is too low")
        if brightness < 20:
            reasons.append("image is too dark")
        elif brightness > 240:
            reasons.append("image is overexposed")
        if contrast < 8:
            reasons.append("image has insufficient contrast")
        if sharpness < 4 and width >= 200 and height >= 200:
            reasons.append("image is too blurry to reliably inspect")

        return {
            "width": width,
            "height": height,
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "sharpness": round(sharpness, 2),
            "quality": "poor" if reasons else "usable",
            "reason": "; ".join(reasons) if reasons else None,
        }

    @staticmethod
    def _meaningful_text(text: str) -> bool:
        meaningful = "".join(character for character in text if character.isalnum())
        return len(meaningful) >= 4 and any(character.isalpha() for character in meaningful)

    @classmethod
    def process_image(cls, image_url: str) -> Dict[str, Any]:
        """
        OCR text extraction from product label images.
        """
        if not image_url:
            raise ValueError("Image URL is required for OCR scanning.")

        try:
            pil_img = cls._fetch_image(image_url)
        except (OSError, ValueError) as err:
            raise ValueError(f"Could not load image from input: {err}") from err

        quality = cls._analyze_image_quality(pil_img)
        diagnostics = get_tesseract_diagnostics()
        if not diagnostics["available"]:
            return {
                "status": "completed_with_warning",
                "raw_text": "",
                "text": "",
                "confidence": 0.0,
                "engine": "tesseract",
                "lines": [],
                "image_quality": "unusable",
                "quality_reason": diagnostics["message"],
                "quality": quality,
            }

        tesseract_command = _resolve_tesseract_command()
        if not tesseract_command:
            return {
                "status": "completed_with_warning",
                "raw_text": "",
                "text": "",
                "confidence": 0.0,
                "engine": "tesseract",
                "lines": [],
                "image_quality": "unusable",
                "quality_reason": "Tesseract OCR is unavailable.",
                "quality": quality,
            }

        pytesseract.pytesseract.tesseract_cmd = tesseract_command
        try:
            processed_img = cls._preprocess_image(pil_img)
        except (OSError, ValueError) as err:
            quality["quality"] = "poor"
            quality["reason"] = f"Image could not be prepared for OCR: {err}"
            return {
                "status": "completed_with_warning",
                "raw_text": "",
                "text": "",
                "confidence": 0.0,
                "engine": "tesseract",
                "lines": [],
                "image_quality": "unusable",
                "quality_reason": quality["reason"],
                "quality": quality,
            }
        candidates = []
        ocr_warning = None
        try:
            for psm in (3, 6, 11):
                try:
                    text = pytesseract.image_to_string(processed_img, config=f"--psm {psm}").strip()
                    if cls._meaningful_text(text):
                        candidates.append(text)
                except (pytesseract.TesseractError, OSError) as err:
                    ocr_warning = str(err)
        except (pytesseract.TesseractError, OSError) as err:
            logger.exception("OCR processing failed")
            ocr_warning = str(err)

        ocr_text = max(candidates, key=len, default="")
        if not ocr_text and ocr_warning:
            quality["reason"] = f"OCR warning: {ocr_warning}"
        elif not ocr_text and not quality["reason"]:
            quality["reason"] = "No readable package-label information was detected."

        confidence = 85.0 if ocr_text else 0.0
        engine_used = "tesseract"

        lines = [line.strip() for line in ocr_text.splitlines() if line.strip()]

        return {
            "status": "success" if ocr_text else "completed_with_warning",
            "text": ocr_text,
            "raw_text": ocr_text,
            "confidence": confidence,
            "engine": engine_used,
            "lines": lines,
            "image_quality": "poor" if quality["quality"] == "poor" else ("usable" if ocr_text else "unusable"),
            "quality_reason": quality["reason"],
            "quality": quality,
        }

def get_ocr_service() -> OCRService:
    """Factory function to get configured OCR service."""
    return OCRService()