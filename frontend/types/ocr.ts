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