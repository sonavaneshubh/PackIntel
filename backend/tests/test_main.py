import base64
import io

from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app
from app.services import ocr_service
from app.api.routes import scan as scan_route
from app.schemas.product import field as make_field
from app.services.ai_service import AIService
from app.services.compliance_service import ComplianceService
from app.services.ocr_service import OCRService

client = TestClient(app)


def image_data_uri(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{encoded}"


def scan(image: Image.Image):
    return client.post("/api/scan", json={"image_url": image_data_uri(image)})


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_cors_preflight_allows_local_frontend():
    response = client.options(
        "/api/scan",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "POST" in response.headers["access-control-allow-methods"]
    assert "authorization" in response.headers["access-control-allow-headers"].lower()
    assert "content-type" in response.headers["access-control-allow-headers"].lower()


def test_low_confidence_scan_uses_structured_vision_fallback(monkeypatch):
    image = Image.new("RGB", (600, 600), "white")

    class FakeOCR:
        def process_image(self, image_url):
            return {
                "raw_text": "Rice",
                "confidence": 25.0,
                "engine": "tesseract",
                "regions": [],
                "image_quality": "usable",
                "quality_reason": None,
            }

    vision_values = {
        field_key: make_field(value=value, status="detected", confidence=95.0, source="vision")
        for field_key, value in {
            "brand_or_commodity_name": "PackIntel Foods",
            "generic_name": "Rice",
            "net_quantity": "5 kg",
            "manufacturer_name": "Acme Foods",
            "mrp": "Rs. 499",
        }.items()
    }

    monkeypatch.setattr(scan_route, "get_ocr_service", lambda: FakeOCR())
    monkeypatch.setattr(scan_route.VisionService, "extract", lambda _: vision_values)
    monkeypatch.setattr(scan_route, "get_current_user", lambda: {"sub": "test-user"})

    response = client.post("/api/scan", json={"image_url": image_data_uri(image)})

    assert response.status_code == 200
    data = response.json()
    assert data["vision_used"] is True
    assert data["extraction_source"] == "ocr+vision"
    # OCR (title-guess "Rice", conf 55) vs vision ("PackIntel Foods") disagree,
    # so the merged field is flagged uncertain for review, not silently chosen.
    assert data["product_information"]["brand_or_commodity_name"]["value"] == "PackIntel Foods"
    assert data["product_information"]["brand_or_commodity_name"]["status"] == "uncertain"
    assert data["product_information"]["expiry_date"]["status"] == "not_visible"


def test_scan_endpoint():
    response = client.post("/api/scan", json={"product_name": "Test Rice"})
    assert response.status_code == 400
    assert response.json()["detail"] == "image_url is required for OCR scanning"


def test_compliance_check_endpoint():
    response = client.post("/api/compliance/check", json={"inspection_id": "test-123"})
    assert response.status_code == 200
    data = response.json()
    assert data["overall_result"] in ["pass", "review", "fail"]


def test_ocr_diagnostics_distinguish_missing_binary(monkeypatch):
    monkeypatch.setattr(ocr_service, "HAS_PYTESSERACT", True)
    monkeypatch.setattr(ocr_service, "_resolve_tesseract_command", lambda: None)

    diagnostics = ocr_service.get_tesseract_diagnostics()

    assert diagnostics == {
        "available": False,
        "reason": "tesseract_missing",
        "message": (
            "Tesseract OCR is not installed or not available in PATH. "
            "Install Tesseract or set TESSERACT_CMD to its executable."
        ),
    }


def test_ocr_diagnostics_distinguish_invalid_configured_binary(monkeypatch):
    monkeypatch.setenv("TESSERACT_CMD", "C:\\missing\\tesseract.exe")
    monkeypatch.setattr(ocr_service, "HAS_PYTESSERACT", True)
    monkeypatch.setattr(ocr_service, "_resolve_tesseract_command", lambda: None)

    diagnostics = ocr_service.get_tesseract_diagnostics()

    assert diagnostics == {
        "available": False,
        "reason": "tesseract_inaccessible",
        "message": "TESSERACT_CMD is configured but the executable cannot be found.",
    }


def test_clear_text_image_completes_with_extracted_information():
    image = Image.new("RGB", (1000, 500), (220, 220, 220))
    draw = ImageDraw.Draw(image)
    draw.rectangle((20, 20, 980, 480), outline="black", width=5)
    draw.text((50, 180), "PRODUCT Rice MRP Rs. 149 Net Quantity 500 g", fill="black", stroke_width=1)

    response = scan(image)

    assert response.status_code == 200
    data = response.json()
    assert data["scan_completed"] is True
    assert data["success"] is True
    assert data["ocr_raw_text"]
    assert data["score"] > 0


def test_partial_text_completes_with_partial_status(monkeypatch):
    image = Image.new("RGB", (1000, 500), (220, 220, 220))
    draw = ImageDraw.Draw(image)
    draw.rectangle((20, 20, 980, 480), outline="black", width=5)
    draw.text((50, 180), "MRP Rs. 149", fill="black", stroke_width=1)
    monkeypatch.setattr(ocr_service.pytesseract, "image_to_string", lambda *args, **kwargs: "MRP Rs. 149")

    response = scan(image)

    assert response.status_code == 200
    data = response.json()
    assert data["scan_completed"] is True
    assert data["status"] == "partial_information"
    assert data["score"] > 0
    assert data["report"]


def test_blank_image_completes_with_zero_score():
    response = scan(Image.new("RGB", (600, 600), "white"))

    assert response.status_code == 200
    data = response.json()
    assert data["scan_completed"] is True
    assert data["score"] == 0
    assert data["status"] == "insufficient_information"
    assert "readable" in data["report"].lower()


def test_blurry_image_completes_as_unusable():
    response = scan(Image.new("RGB", (600, 600), (128, 128, 128)))

    assert response.status_code == 200
    data = response.json()
    assert data["scan_completed"] is True
    assert data["score"] == 0
    assert data["image_quality"] == "poor"
    assert data["report"]


def test_random_object_image_completes_without_scan_error():
    image = Image.new("RGB", (600, 600), "#4f7f58")
    response = scan(image)

    assert response.status_code == 200
    data = response.json()
    assert data["scan_completed"] is True
    assert data["score"] == 0
    assert data["status"] == "insufficient_information"


def test_empty_ocr_completes_without_ocr_failure(monkeypatch):
    monkeypatch.setattr(ocr_service.pytesseract, "image_to_string", lambda *args, **kwargs: "")

    response = scan(Image.new("RGB", (600, 600), "white"))

    assert response.status_code == 200
    assert response.json()["scan_completed"] is True
    assert response.json()["ocr_raw_text"] == ""
    assert response.json()["score"] == 0
    assert "OCR returned no text" not in response.text


def test_expected_ocr_exception_completes_with_warning(monkeypatch):
    def raise_ocr_error(*args, **kwargs):
        raise ocr_service.pytesseract.TesseractError("test OCR failure", 1)

    monkeypatch.setattr(ocr_service.pytesseract, "image_to_string", raise_ocr_error)

    response = scan(Image.new("RGB", (600, 600), "white"))

    assert response.status_code == 200
    data = response.json()
    assert data["scan_completed"] is True
    assert data["score"] == 0
    assert "OCR warning" in data["report"]


def test_normal_compliance_scan_keeps_success_response():
    image = Image.new("RGB", (1000, 500), (220, 220, 220))
    draw = ImageDraw.Draw(image)
    draw.rectangle((20, 20, 980, 480), outline="black", width=5)
    draw.text(
        (40, 120),
        "MANUFACTURER Acme Foods, Delhi\nPRODUCT Rice\nNet Quantity 5 kg\nMRP Rs. 499\nMFD 01/2026",
        fill="black",
        stroke_width=1,
    )

    response = client.post(
        "/api/scan",
        json={"image_url": image_data_uri(image), "product_name": "Rice", "manufacturer_name": "Acme Foods"},
    )

    assert response.status_code == 200
    assert response.json()["scan_completed"] is True
    assert response.json()["success"] is True


def test_ai_extraction_sample_label():
    text = (
        "PREMIUM BASMATI RICE\n"
        "Net Quantity 5 kg\n"
        "MRP Rs. 499 (Incl. of all taxes)\n"
        "MFD 01/2026\n"
        "Manufacturer: Acme Foods Pvt Ltd\n"
        "12 MG Road, Mumbai - 400001\n"
        "Customer Care: 1800-123-456\n"
        "Country of Origin: India\n"
        "FSSAI Lic No. 12345678901234"
    )
    fields, conf = AIService.extract_with_confidence(text)

    assert fields["commodity_name"] == "PREMIUM BASMATI RICE"
    assert fields["net_quantity"] == "5 kg"
    assert fields["mrp"] == "Rs. 499 (Incl. of all taxes)"
    assert fields["month_year_packed"] == "01/2026"
    assert "Acme Foods" in fields["manufacturer_name"]
    assert fields["country_of_origin"] == "India"
    assert "1800" in fields["consumer_care"]
    assert conf["overall"] > 0


def test_ai_extraction_ignores_unrelated_numbers():
    fields, conf = AIService.extract_with_confidence(
        "Some random package with numbers 149, 500 and 2026 but no label."
    )
    assert fields["mrp"] is None
    assert fields["net_quantity"] is None
    assert fields["month_year_packed"] is None
    assert conf["overall"] == 0


def test_ai_extraction_does_not_fallback_to_request_metadata():
    text = "MRP Rs. 99\nNet Quantity 250 ml"
    fields, _ = AIService.extract_with_confidence(text)
    assert fields["commodity_name"] is None
    assert fields["manufacturer_name"] is None


def test_compliance_weighted_score_and_overall():
    declarations = {
        "manufacturer_name": "Acme Foods",
        "net_quantity": "5 kg",
        "mrp": "Rs. 499",
        "month_year_packed": "01/2026",
        "commodity_name": "Rice",
        "customer_care": "1800-123-456",
    }
    response = ComplianceService.evaluate_compliance("INS-X", declarations, is_imported=False)
    assert response.compliance_score == 100
    assert response.risk_score == 0
    assert response.overall_result == "pass"
    assert any(r.result == "not_applicable" for r in response.results)

    empty = ComplianceService.evaluate_compliance("INS-Y", {}, is_imported=False)
    assert empty.compliance_score == 0
    assert empty.risk_score == 100
    assert empty.overall_result == "review"


def test_compliance_imported_package_requires_origin():
    response = ComplianceService.evaluate_compliance("INS-Z", {"net_quantity": "250 g"}, is_imported=True)
    assert response.overall_result == "review"
    pc07 = next(r for r in response.results if r.rule_code == "PC-07")
    assert pc07.result == "warning"


def test_ocr_confidence_and_regions_from_data_layer(monkeypatch):
    data = {
        "level": [5, 5],
        "conf": [88.0, 75.0],
        "text": ["MRP", "Rs."],
        "left": [10, 120],
        "top": [30, 30],
        "width": [90, 40],
        "height": [20, 20],
    }
    image = Image.new("RGB", (400, 200), (255, 255, 255))
    monkeypatch.setattr(
        OCRService,
        "_run_tesseract_string",
        lambda img, psm: "MRP Rs. 149" if psm == 3 else "",
    )
    monkeypatch.setattr(OCRService, "_run_tesseract_data", lambda img, psm: data)

    result = OCRService.process_image(image_data_uri(image))

    assert result["text"] == "MRP Rs. 149"
    assert result["confidence"] == 81.5
    assert result["regions"]
    assert result["regions"][0]["text"] == "MRP"
    assert 0 <= result["regions"][0]["left"] <= 1
    assert 0 <= result["regions"][0]["top"] <= 1