from fastapi.testclient import TestClient
from app.main import app
from app.services import ocr_service

client = TestClient(app)


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
