import base64
import io

from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app
from app.services import ocr_service

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
