"""Optional multimodal vision fallback for low-confidence or incomplete OCR.

Design notes
------------
* Provider is selected via environment variables (VISION_PROVIDER /
  VISION_MODEL / VISION_API_KEY, with OPENAI_* accepted as legacy aliases).
* The provider is never hard-coded into the application architecture — a new
  provider only needs to implement the small ``VisionProvider`` interface.
* Extraction never invents values: a field is only 'detected' when the model
  actually reported a value; otherwise it is 'not_visible' (image does not
  show it) or 'not_printed' (model explicitly asserts absence).
* Every provider failure raises ``VisionExtractionError`` so the caller can
  keep the usable OCR results instead of failing the whole scan.
"""

import json
import logging
import re
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.schemas.product import (
    PRODUCT_FIELDS,
    CONFLICT_SENSITIVE_FIELDS,
    ProductField,
    field as make_field,
)

logger = logging.getLogger(__name__)

CRITICAL_FIELDS = (
    "brand_or_commodity_name",
    "generic_name",
    "net_quantity",
    # "manufacturer/packer information" is a group: at least one identity
    # declaration must be present (checked separately via _IDENTITY_FIELDS).
    "mrp",
    "packing_date",
    "manufacturing_date",
)

_IDENTITY_FIELDS = ("manufacturer_name", "packer_name", "marketer_name")


class VisionExtractionError(RuntimeError):
    """Raised when the configured vision provider cannot return structured data."""


class VisionProvider:
    name: str = "base"

    def is_configured(self) -> bool:
        raise NotImplementedError

    def extract(self, image_url: str) -> Dict[str, ProductField]:
        raise NotImplementedError


def should_use_vision_fallback(
    ocr_confidence: float,
    ocr_failed: bool,
    product_information: Any,
) -> bool:
    """Decide whether the vision model should be invoked as a fallback.

    Condition A: OCR confidence < 50
    Condition B: OCR failed (no readable text)
    Condition C: one or more critical fields were not reliably extracted
    """
    if ocr_failed:
        return True
    # Below 50% is the hard fallback requirement. Medium-confidence OCR is
    # also sent to vision so disagreements can be detected before persistence.
    if (ocr_confidence or 0.0) < 70.0:
        return True

    if isinstance(product_information, dict):
        fields: Dict[str, Any] = product_information
    else:
        fields = product_information.as_dict() if hasattr(product_information, "as_dict") else {}

    def detected(key: str) -> bool:
        entry = fields.get(key)
        if entry is None:
            return False
        if isinstance(entry, ProductField):
            return bool(entry.value) and entry.status == "detected"
        if isinstance(entry, dict):
            return bool(entry.get("value")) and entry.get("status") == "detected"
        return bool(entry)

    for key in CRITICAL_FIELDS:
        if not detected(key):
            return True

    # Identity is satisfied when any manufacturer/packer/marketer is detected.
    if not any(detected(key) for key in _IDENTITY_FIELDS):
        return True
    return False


# ---------------------------------------------------------------------------
# Value / status normalization helpers
# ---------------------------------------------------------------------------

_TRUE_STATUS = "detected"
_STATUS_SYNONYMS = {
    "detected": "detected",
    "visible": "detected",
    "present": "detected",
    "read": "detected",
    "printed": "detected",
    "found": "detected",
    "not_printed": "not_printed",
    "not printed": "not_printed",
    "notprinted": "not_printed",
    "absent": "not_printed",
    "not_visible": "not_visible",
    "not visible": "not_visible",
    "notvisible": "not_visible",
    "unreadable": "not_visible",
    "not readable": "not_visible",
    "blurred": "not_visible",
    "missing": "not_visible",
    "uncertain": "uncertain",
    "maybe": "uncertain",
    "conflict": "uncertain",
    "review": "uncertain",
}

_EMPTY_TOKENS = {"", "none", "n/a", "na", "null", "not applicable", "unknown", "-"}


def _clean_text(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, bool):
        return "Yes" if value else None
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        return ", ".join(cleaned) if cleaned else None
    text = str(value).strip()
    if text.lower() in _EMPTY_TOKENS:
        return None
    return text


def _clean_status(raw: Any, value: Optional[str]) -> str:
    status = str(raw or "").strip().lower()
    status = _STATUS_SYNONYMS.get(status, status)
    if status not in {"detected", "not_printed", "not_visible", "uncertain"}:
        status = "detected" if value else "not_visible"
    if status == "detected" and not value:
        # A model claiming detection without a value is a hallucination hazard.
        status = "not_visible"
    return status


def _norm_field(raw: Any) -> ProductField:
    value = None
    status = None
    confidence: Any = 0.0
    if isinstance(raw, dict):
        value = _clean_text(raw.get("value"))
        status = _clean_status(raw.get("status"), value)
        confidence = raw.get("confidence", 0.0)
    else:
        value = _clean_text(raw)
        status = "detected" if value else "not_visible"
    try:
        confidence = max(0.0, min(100.0, float(confidence)))
    except (TypeError, ValueError):
        confidence = 0.0
    return make_field(value=value, status=status, confidence=confidence, source="vision")


def _extract_payload(payload: Dict[str, Any]) -> Dict[str, ProductField]:
    result: Dict[str, ProductField] = {}
    root: Dict[str, Any] = payload
    if isinstance(payload.get("product_information"), dict):
        root = payload["product_information"]
    if isinstance(payload.get("fields"), dict):
        root = payload["fields"]

    for key in PRODUCT_FIELDS:
        if key in root:
            result[key] = _norm_field(root[key])
        else:
            result[key] = make_field(status="not_visible", source="none")
    return result


def _parse_json(content: str) -> Dict[str, ProductField]:
    content = (content or "").strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", content, re.DOTALL)
    if fence:
        content = fence.group(1).strip()
    if not content:
        raise VisionExtractionError("Vision provider returned empty content.")
    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise VisionExtractionError("Vision provider returned invalid structured JSON.") from exc
    if not isinstance(payload, dict):
        raise VisionExtractionError("Vision provider returned a non-object payload.")
    return _extract_payload(payload)


# ---------------------------------------------------------------------------
# OpenAI-compatible provider (messages content array with image_url)
# ---------------------------------------------------------------------------

_PROMPT_TEMPLATE = """You are extracting information from a packaged commodity label.

Read only information that is visibly present in the supplied image.
Do not infer, guess, complete, or hallucinate values.

Return ONLY a single valid JSON object. For EVERY field use one of these shapes:
  "field_name": {{"value": "...", "status": "detected", "confidence": 0-100}}
  "field_name": {{"value": null, "status": "not_visible", "confidence": 0}}
  "field_name": {{"value": null, "status": "not_printed", "confidence": 100}}
Use status "not_visible" when the image does not contain readable evidence.
Use status "not_printed" ONLY when the visible artwork clearly shows the declaration is absent.
Use status "uncertain" when the visible text is ambiguous.
Preserve numbers exactly where possible. Distinguish MRP, net quantity, batch number,
manufacturing/packing date, expiry date, FSSAI number, and customer-care contacts.

Return exactly these keys:
{fields}"""


class OpenAICompatibleProvider(VisionProvider):
    name = "openai"

    @property
    def _api_key(self) -> str:
        return settings.VISION_API_KEY.strip() or settings.OPENAI_API_KEY.strip()

    def is_configured(self) -> bool:
        return bool(self._api_key and settings.VISION_MODEL.strip())

    def extract(self, image_url: str) -> Dict[str, ProductField]:
        if not image_url:
            raise VisionExtractionError("No image URL was provided to the vision provider.")

        prompt = _PROMPT_TEMPLATE.format(fields=", ".join(PRODUCT_FIELDS))
        payload = {
            "model": settings.VISION_MODEL,
            "temperature": 0,
            "max_tokens": 2000,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url, "detail": "high"}},
                    ],
                }
            ],
        }
        request = urllib.request.Request(
            settings.OPENAI_API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
                "User-Agent": "PackIntel-Vision-Scanner/2.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=settings.VISION_TIMEOUT_SECONDS) as response:
                response_data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            raise VisionExtractionError(
                f"Vision provider request failed (HTTP {exc.code})."
            ) from exc
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise VisionExtractionError("Vision provider request failed.") from exc

        try:
            content = str(response_data["choices"][0]["message"]["content"])
        except (KeyError, IndexError, TypeError) as exc:
            raise VisionExtractionError("Vision provider returned no extraction content.") from exc
        return _parse_json(content)


_PROVIDERS: Dict[str, VisionProvider] = {
    "openai": OpenAICompatibleProvider(),
}


def get_vision_service() -> Optional[VisionProvider]:
    """Return the provider selected by VISION_PROVIDER (default: openai)."""
    provider_name = (settings.VISION_PROVIDER or "openai").strip().lower()
    if provider_name == "none":
        return None
    provider = _PROVIDERS.get(provider_name)
    if provider is None:
        logger.warning("Unknown VISION_PROVIDER '%s'; treating vision as disabled.", provider_name)
        return None
    if not provider.is_configured():
        return None
    return provider


class VisionService:
    """Facade mirroring the Phase 1 call surface (scan.py + tests)."""

    @staticmethod
    def is_configured() -> bool:
        return get_vision_service() is not None

    @staticmethod
    def extract(image_url: str) -> Dict[str, ProductField]:
        provider = get_vision_service()
        if provider is None:
            raise VisionExtractionError(
                "No vision provider is configured (set VISION_PROVIDER/VISION_API_KEY/VISION_MODEL)."
            )
        return provider.extract(image_url)