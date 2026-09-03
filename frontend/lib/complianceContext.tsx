'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  ScanRecord,
  QualityCheckItem,
  PipelineStage,
  AnalysisLog,
  ExtractedEntity,
  BoundingBox,
  DetectedDeclaration,
  KPIStats,
} from '@/types';
import {
  INITIAL_KPI_STATS,
  RECENT_SCANS,
  QUALITY_CHECK_ITEMS,
  PIPELINE_STAGES,
  INITIAL_ANALYSIS_LOGS,
  OCR_BOUNDING_BOXES,
  EXTRACTED_ENTITIES,
  INITIAL_DECLARATIONS,
} from '@/lib/mockData';

interface ProductFormData {
  productName: string;
  category: string;
  manufacturer: string;
  isImported: boolean;
}

interface ComplianceContextType {
  kpiStats: KPIStats;
  scans: ScanRecord[];
  productForm: ProductFormData;
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
  uploadedImageUrl: string | null;
  setUploadedImageUrl: (url: string | null) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  qualityChecks: QualityCheckItem[];
  pipelineStages: PipelineStage[];
  setPipelineStages: React.Dispatch<React.SetStateAction<PipelineStage[]>>;
  analysisLogs: AnalysisLog[];
  setAnalysisLogs: React.Dispatch<React.SetStateAction<AnalysisLog[]>>;
  boundingBoxes: BoundingBox[];
  setBoundingBoxes: React.Dispatch<React.SetStateAction<BoundingBox[]>>;
  extractedEntities: ExtractedEntity[];
  setExtractedEntities: React.Dispatch<React.SetStateAction<ExtractedEntity[]>>;
  declarations: DetectedDeclaration[];
  setDeclarations: React.Dispatch<React.SetStateAction<DetectedDeclaration[]>>;
  activeBoundingBoxId: string | null;
  setActiveBoundingBoxId: (id: string | null) => void;
  updateDeclaration: (id: string, updatedValue: string) => void;
  resetScanPipeline: () => void;
  runSimulatedAnalysis: (onComplete?: () => void) => () => void;
  currentInspectionId: string | null;
  setCurrentInspectionId: (id: string | null) => void;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

export function ComplianceProvider({ children }: { children: ReactNode }) {
  const [kpiStats, setKpiStats] = useState<KPIStats>(INITIAL_KPI_STATS);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [productForm, setProductForm] = useState<ProductFormData>({
    productName: '',
    category: 'food',
    manufacturer: '',
    isImported: false,
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [qualityChecks, setQualityChecks] = useState<QualityCheckItem[]>(QUALITY_CHECK_ITEMS);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(PIPELINE_STAGES);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLog[]>(INITIAL_ANALYSIS_LOGS);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>([]);
  const [declarations, setDeclarations] = useState<DetectedDeclaration[]>([]);
  const [activeBoundingBoxId, setActiveBoundingBoxId] = useState<string | null>(null);
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);

  const updateDeclaration = (id: string, updatedValue: string) => {
    setDeclarations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              value: updatedValue,
              confidence: 99,
              reviewRequired: false,
              warningNote: undefined,
            }
          : item
      )
    );
  };

  const resetScanPipeline = () => {
    setPipelineStages([
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
    ]);
    setAnalysisLogs([
      { id: '1', message: 'Initializing OCR engine & neural model...', status: 'running' },
    ]);
  };

  const runSimulatedAnalysis = (onComplete?: () => void) => {
    resetScanPipeline();

    const timeouts: NodeJS.Timeout[] = [];

    // Stage 1: Read
    timeouts.push(
      setTimeout(() => {
        setPipelineStages((prev) =>
          prev.map((s) => (s.id === 'read' ? { ...s, status: 'active', progress: 45 } : s))
        );
        setAnalysisLogs((prev) => [
          ...prev,
          { id: '2', message: 'Image preprocessing complete', status: 'complete' },
          { id: '3', message: 'Detecting text regions and bounding boxes...', status: 'running' },
        ]);
      }, 800)
    );

    timeouts.push(
      setTimeout(() => {
        setPipelineStages((prev) =>
          prev.map((s) => (s.id === 'read' ? { ...s, progress: 100, status: 'complete' } : s))
        );
        setAnalysisLogs((prev) => [
          ...prev.map((l) => (l.id === '3' ? { ...l, status: 'complete' as const } : l)),
          { id: '4', message: 'Text regions detected (6 entities identified)', status: 'complete' },
        ]);
      }, 2000)
    );

    // Stage 2: Understand
    timeouts.push(
      setTimeout(() => {
        setPipelineStages((prev) =>
          prev.map((s) => (s.id === 'understand' ? { ...s, status: 'active', progress: 85 } : s))
        );
        setAnalysisLogs((prev) => [
          ...prev,
          { id: '5', message: 'Extracting declarations & semantic fields...', status: 'running' },
        ]);
      }, 2600)
    );

    timeouts.push(
      setTimeout(() => {
        setPipelineStages((prev) =>
          prev.map((s) => (s.id === 'understand' ? { ...s, progress: 100, status: 'complete' } : s))
        );
        setAnalysisLogs((prev) => [
          ...prev.map((l) => (l.id === '5' ? { ...l, status: 'complete' as const } : l)),
          { id: '6', message: 'Mapped MRP, Net Quantity, Manufacturer, Dates', status: 'complete' },
        ]);
      }, 3800)
    );

    // Stage 3: Check
    timeouts.push(
      setTimeout(() => {
        setPipelineStages((prev) =>
          prev.map((s) => (s.id === 'check' ? { ...s, status: 'active', progress: 100 } : s))
        );
        setAnalysisLogs((prev) => [
          ...prev,
          { id: '7', message: 'Evaluating Legal Metrology Act Rule 6(1)...', status: 'complete' },
        ]);
      }, 4500)
    );

    // Stage 4: Explain
    timeouts.push(
      setTimeout(() => {
        setPipelineStages((prev) =>
          prev.map((s) => (s.id === 'explain' ? { ...s, status: 'complete', progress: 100 } : s))
        );
        setAnalysisLogs((prev) => [
          ...prev,
          { id: '8', message: 'Evidence generated & report finalized', status: 'complete' },
        ]);
        if (onComplete) onComplete();
      }, 5500)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  };

  return (
    <ComplianceContext.Provider
      value={{
        kpiStats,
        scans,
        productForm,
        setProductForm,
        uploadedImageUrl,
        setUploadedImageUrl,
        selectedFile,
        setSelectedFile,
        qualityChecks,
        pipelineStages,
        setPipelineStages,
        analysisLogs,
        setAnalysisLogs,
        boundingBoxes,
        setBoundingBoxes,
        extractedEntities,
        setExtractedEntities,
        declarations,
        setDeclarations,
        activeBoundingBoxId,
        setActiveBoundingBoxId,
        updateDeclaration,
        resetScanPipeline,
        runSimulatedAnalysis,
        currentInspectionId,
        setCurrentInspectionId,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
}

export function useCompliance() {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
}
