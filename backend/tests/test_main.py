from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_scan_endpoint():
    response = client.post("/api/scan", json={"product_name": "Test Rice"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "inspection_id" in data


def test_compliance_check_endpoint():
    response = client.post("/api/compliance/check", json={"inspection_id": "test-123"})
    assert response.status_code == 200
    data = response.json()
    assert data["overall_result"] in ["pass", "review", "fail"]
