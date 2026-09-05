# PackIntel Backend API Specification

Base URL: `http://localhost:5000`

## Endpoints Summary

### 1. Health Check
`GET /health`
- **Response**: `{"status": "ok"}`

### 2. Scan Execution
`POST /api/scan`
- **Request Body**:
  ```json
  {
    "image_url": "https://example.com/label.jpg",
    "product_name": "Premium Rice 5 kg",
    "category": "food",
    "manufacturer": "ABC Foods Pvt. Ltd.",
    "is_imported": false
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "inspection_id": "INS-A1B2C3D4",
    "message": "Scan completed and declarations extracted.",
    "ocr_raw_text": "...",
    "extracted_declarations": {}
  }
  ```

### 3. Create Inspection
`POST /api/inspection`

### 4. List Inspections
`GET /api/inspections`

### 5. Get Inspection Details
`GET /api/inspection/{inspection_id}`

### 6. Compliance Evaluation
`POST /api/compliance/check`
- **Request Body**:
  ```json
  {
    "inspection_id": "INS-A1B2C3D4",
    "declarations": {}
  }
  ```
- **Response**:
  ```json
  {
    "inspection_id": "INS-A1B2C3D4",
    "overall_result": "pass",
    "risk_score": 5,
    "results": []
  }
  ```

### 7. Report Generation
`POST /api/reports/generate`
- **Request Body**:
  ```json
  {
    "inspection_id": "INS-A1B2C3D4",
    "format": "pdf"
  }
  ```
- **Response**:
  ```json
  {
    "report_id": "RPT-12345678",
    "inspection_id": "INS-A1B2C3D4",
    "download_url": "/api/reports/download/RPT-12345678.pdf",
    "generated_at": "2026-09-03T11:40:00Z"
  }
  ```
