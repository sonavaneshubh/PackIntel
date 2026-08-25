export type ComplianceStatus = 'PASS' | 'REVIEW' | 'FAIL';

export interface ScanRecord {
  id: string;
  productName: string;
  category: string;
  date: string;
  status: ComplianceStatus;
  confidence: number;
  issueCount: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  manufacturer?: string;
  mrp?: string;
  netQuantity?: string;
}

export interface KPIStats {
  totalScans: number;
  totalScansGrowth: string;
  passCount: number;
  passPercentage: number;
  reviewCount: number;
  reviewPercentage: number;
  failCount: number;
  failPercentage: number;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  top: string;
  left: string;
  width: string;
  height: string;
  color: string;
  bgOpacity: string;
}

export interface ExtractedEntity {
  id: string;
  name: string;
  extractedValue: string;
  confidence: number;
  status: 'good' | 'warning' | 'error';
  colorDot: string;
}

export interface DetectedDeclaration {
  id: string;
  key: string;
  label: string;
  value: string;
  confidence: number;
  reviewRequired?: boolean;
  warningNote?: string;
  evidenceImageUrl?: string;
}

export interface QualityCheckItem {
  id: string;
  title: string;
  statusText: string;
  status: 'good' | 'warning' | 'error' | 'pending';
  icon: string;
}

export interface PipelineStage {
  id: 'read' | 'understand' | 'check' | 'explain';
  name: string;
  progress: number;
  status: 'active' | 'pending' | 'complete';
  icon: string;
  description: string;
}

export interface AnalysisLog {
  id: string;
  message: string;
  status: 'complete' | 'running' | 'pending';
  timestamp?: string;
}
