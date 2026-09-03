// API Client module for Backend FastAPI integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface HealthResponse {
  status: string;
}

export interface ScanRequest {
  image_url?: string;
  product_name?: string;
  category?: string;
  manufacturer?: string;
  is_imported?: boolean;
}

export interface ScanResponse {
  status: string;
  inspection_id: string;
  message: string;
  ocr_raw_text?: string;
  extracted_declarations?: Record<string, unknown>;
}

export interface ComplianceCheckRequest {
  inspection_id?: string;
  declarations?: Record<string, unknown>;
}

export interface ComplianceCheckResponse {
  inspection_id?: string;
  overall_result: 'pass' | 'review' | 'fail';
  risk_score: number;
  results: Array<{
    rule_id: string;
    rule_name: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
  }>;
}

export interface ReportGenerationRequest {
  inspection_id: string;
  format?: 'pdf' | 'json';
}

export interface ReportGenerationResponse {
  report_id: string;
  inspection_id: string;
  download_url: string;
  generated_at: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getHealth: (): Promise<HealthResponse> => fetchApi<HealthResponse>('/health'),

  scan: (data: ScanRequest): Promise<ScanResponse> =>
    fetchApi<ScanResponse>('/api/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createInspection: (data: Record<string, unknown>): Promise<Record<string, unknown>> =>
    fetchApi<Record<string, unknown>>('/api/inspection', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getInspections: (): Promise<Record<string, unknown>[]> =>
    fetchApi<Record<string, unknown>[]>('/api/inspections'),

  getInspectionById: (inspectionId: string): Promise<Record<string, unknown>> =>
    fetchApi<Record<string, unknown>>(`/api/inspection/${inspectionId}`),

  checkCompliance: (data: ComplianceCheckRequest): Promise<ComplianceCheckResponse> =>
    fetchApi<ComplianceCheckResponse>('/api/compliance/check', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generateReport: (data: ReportGenerationRequest): Promise<ReportGenerationResponse> =>
    fetchApi<ReportGenerationResponse>('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
