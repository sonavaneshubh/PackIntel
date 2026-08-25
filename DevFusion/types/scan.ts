export type ComplianceStatus = "PASS" | "REVIEW" | "FAIL";

export interface ScanRecord {
  id: string;
  productName: string;
  category: string;
  date: string;
  status: ComplianceStatus;
  confidence: number;
  issueCount: number;
  manufacturer: string;
  mrp: string;
  netQuantity: string;
  imageUrl?: string;
  thumbnailUrl?: string;
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

export interface ProductFormData {
  productName: string;
  category: string;
  manufacturer: string;
  isImported: boolean;
}
