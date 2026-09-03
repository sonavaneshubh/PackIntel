import {
  KPIStats,
  ScanRecord,
  QualityCheckItem,
  PipelineStage,
  AnalysisLog,
  ExtractedEntity,
  BoundingBox,
  DetectedDeclaration,
  HighPriorityInspection,
  CrossSurfaceInconsistency,
  HistoricalChangeRecord,
  ViolationPattern,
} from '@/types';
import { complianceRules } from '@/lib/constants/complianceRules';

export const RULE_DATABASE_ITEMS = complianceRules;

export const INITIAL_KPI_STATS: KPIStats = {
  totalScans: 0,
  totalScansGrowth: '0%',
  passCount: 0,
  passPercentage: 0,
  reviewCount: 0,
  reviewPercentage: 0,
  failCount: 0,
  failPercentage: 0,
  highPriorityCount: 0,
  highPriorityDescription: 'Require immediate attention',
};

export const RECENT_SCANS: ScanRecord[] = [];

export const HIGH_PRIORITY_INSPECTIONS: HighPriorityInspection[] = [];

export const HISTORICAL_CHANGES: HistoricalChangeRecord[] = [];

export const CROSS_SURFACE_INCONSISTENCIES: CrossSurfaceInconsistency[] = [];

export const TOP_VIOLATION_PATTERNS: ViolationPattern[] = [];

export const QUALITY_CHECK_ITEMS: QualityCheckItem[] = [
  {
    id: 'res',
    title: 'Resolution',
    statusText: 'Awaiting image',
    status: 'pending',
    icon: 'lens_blur',
  },
  {
    id: 'framing',
    title: 'Framing Complete',
    statusText: 'Awaiting image',
    status: 'pending',
    icon: 'aspect_ratio',
  },
  {
    id: 'lighting',
    title: 'Lighting Check',
    statusText: 'Awaiting image',
    status: 'pending',
    icon: 'wb_incandescent',
  },
  {
    id: 'orientation',
    title: 'Orientation',
    statusText: 'Awaiting image',
    status: 'pending',
    icon: 'crop_rotate',
  },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'read',
    name: 'Read',
    progress: 0,
    status: 'pending',
    icon: 'document_scanner',
    description: 'Image preprocessing, OCR text extraction, Bounding-box detection.',
  },
  {
    id: 'understand',
    name: 'Understand',
    progress: 0,
    status: 'pending',
    icon: 'psychology',
    description: 'Declaration extraction, Entity identification.',
  },
  {
    id: 'check',
    name: 'Check',
    progress: 0,
    status: 'pending',
    icon: 'rule',
    description: 'Rule matching, Compliance evaluation.',
  },
  {
    id: 'explain',
    name: 'Explain',
    progress: 0,
    status: 'pending',
    icon: 'assignment',
    description: 'Evidence generation, Compliance report.',
  },
];

export const INITIAL_ANALYSIS_LOGS: AnalysisLog[] = [];

export const OCR_BOUNDING_BOXES: BoundingBox[] = [];

export const EXTRACTED_ENTITIES: ExtractedEntity[] = [];

export const INITIAL_DECLARATIONS: DetectedDeclaration[] = [];

