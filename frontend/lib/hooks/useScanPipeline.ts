'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  createInspection,
  uploadInspectionImage,
  saveExtractedLabel,
  saveComplianceResults,
  updateInspection,
  getInspectionById,
} from '@/lib/supabase/inspectionService';
import { Inspection, ExtractedLabelInsert, ComplianceResultInsert, InspectionImage } from '@/types/database';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ScanPipelineState {
  step: 'idle' | 'creating' | 'uploading' | 'ocr' | 'extracting' | 'compliance' | 'completed' | 'error';
  inspection: Inspection | null;
  image: InspectionImage | null;
  ocrText: string | null;
  extractedLabels: ExtractedLabelInsert | null;
  complianceResults: ComplianceResultInsert[] | null;
  inexact: boolean;
  extractionSource: string | null;
  visionUsed: boolean;
  visionError: string | null;
  error: string | null;
  progress: number;
}

export function useScanPipeline() {
  const router = useRouter();
  const [state, setState] = useState<ScanPipelineState>({
    step: 'idle',
    inspection: null,
    image: null,
    ocrText: null,
    extractedLabels: null,
    complianceResults: null,
    inexact: false,
    extractionSource: null,
    visionUsed: false,
    visionError: null,
    error: null,
    progress: 0,
  });

  // Use a ref to track the current inspection for error handling
  const inspectionRef = useRef<Inspection | null>(null);

  const updateState = useCallback((updates: Partial<ScanPipelineState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      if (updates.inspection) {
        inspectionRef.current = updates.inspection;
      }
      return newState;
    });
  }, []);

  const runFullPipeline = useCallback(async (
    file: File,
    productData: {
      product_name: string;
      brand_name: string;
      manufacturer_name: string;
      product_category: string;
      is_imported: boolean;
    }
  ) => {
    updateState({ step: 'creating', error: null, progress: 5 });

    let currentInspection: Inspection | null = null;

    try {
      // Step 1: Create inspection record
      const { data: inspection, error: inspectionError } = await createInspection({
        product_name: productData.product_name,
        brand_name: productData.brand_name,
        manufacturer_name: productData.manufacturer_name,
        product_category: productData.product_category,
        is_imported: productData.is_imported,
        status: 'processing',
      });

      if (inspectionError || !inspection) {
        throw new Error(inspectionError || 'Failed to create inspection');
      }

      currentInspection = inspection;
      updateState({ inspection, step: 'uploading', progress: 15 });

      // Step 2: Upload image to Supabase Storage
      const { data: image, error: uploadError } = await uploadInspectionImage(
        inspection.id,
        file,
        'label_front'
      );

      if (uploadError || !image) {
        throw new Error(uploadError || 'Failed to upload image');
      }

      updateState({ image, step: 'ocr', progress: 30 });

      // Step 3: Call backend for OCR processing
      const ocrResponse = await fetch(`${API_BASE_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: image.public_url,
          ...productData,
        }),
      });

      if (!ocrResponse.ok) {
        const errorData = await ocrResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'OCR processing failed');
      }

      const ocrData = await ocrResponse.json();
      const ocrText = ocrData.ocr_raw_text || '';
      const extractedDeclarations = ocrData.extracted_declarations || {};
      const productInformation =
        typeof ocrData.product_information === 'string'
          ? JSON.parse(ocrData.product_information || '{}')
          : (ocrData.product_information || {});
      const ocrConfidence = Number(ocrData.ocr_confidence) || 0;
      const extractionConfidence = Number(ocrData.extraction_confidence);
      const ocrRegions = Array.isArray(ocrData.ocr_regions) ? ocrData.ocr_regions : [];

      updateState({
        ocrText,
        step: 'extracting',
        progress: 50,
        inexact: Boolean(ocrData.vision_used) || Object.values(productInformation).some(
          (entry: any) => entry?.status === 'uncertain',
        ),
        extractionSource: ocrData.extraction_source || 'ocr',
        visionUsed: Boolean(ocrData.vision_used),
        visionError: ocrData.vision_error || null,
      });

      // Step 4: Save OCR text, real confidence and word regions to inspection_images
      if (image.id) {
        await supabase
          .from('inspection_images')
          .update({
            ocr_text: ocrText,
            ocr_confidence: ocrConfidence,
            ocr_engine: ocrData.ocr_engine || 'tesseract',
            ocr_regions: ocrRegions,
          })
          .eq('id', image.id);
      }

      // Step 5: Save extracted labels (from OCR text only, never request metadata)
      const labelData: ExtractedLabelInsert = {
        inspection_id: inspection.id,
        manufacturer_name: extractedDeclarations.manufacturer_name || null,
        packer_name: extractedDeclarations.packer_name || null,
        importer_name: extractedDeclarations.importer_name || null,
        commodity_name: extractedDeclarations.commodity_name || extractedDeclarations.common_generic_name || null,
        net_quantity: extractedDeclarations.net_quantity || null,
        mrp: extractedDeclarations.mrp || null,
        month_year_packed: extractedDeclarations.month_year_packed || extractedDeclarations.mfg_date || null,
        customer_care_details: extractedDeclarations.customer_care_details || extractedDeclarations.consumer_care || null,
        country_of_origin: extractedDeclarations.country_of_origin || null,
        other_declarations: JSON.stringify({
          notes: extractedDeclarations.other_declarations || '',
          product_information: productInformation,
          extraction_source: ocrData.extraction_source || 'ocr',
          vision_used: Boolean(ocrData.vision_used),
          vision_error: ocrData.vision_error || null,
        }),
        product_information: productInformation,
        raw_ocr_text: ocrText,
        extraction_confidence: Number.isFinite(extractionConfidence) ? extractionConfidence : null,
        ocr_confidence: ocrConfidence,
      };

      const { data: savedLabel, error: labelError } = await saveExtractedLabel(labelData);
      if (labelError) throw new Error(labelError);

      updateState({ extractedLabels: savedLabel, step: 'compliance', progress: 70 });

      // Step 6: Persist compliance results computed by the backend
      const complianceResults: ComplianceResultInsert[] = (ocrData.compliance_results || []).map((rule: any) => ({
        inspection_id: inspection.id,
        rule_code: rule.rule_code,
        rule_name: rule.rule_name,
        requirement: rule.requirement || null,
        extracted_value: rule.extracted_value || null,
        result: rule.result,
        explanation: rule.explanation,
        evidence: rule.evidence || null,
      }));

      const { error: complianceError } = await saveComplianceResults(complianceResults);
      if (complianceError) throw new Error(complianceError);

      updateState({ complianceResults, step: 'completed', progress: 90 });

      // Step 7: Persist the overall result, risk and compliance score from the backend
      const overallResult: 'pass' | 'fail' | 'review' | 'pending' =
        ocrData.overall_result === 'fail'
          ? 'fail'
          : ocrData.overall_result === 'pass'
            ? 'pass'
            : ocrData.overall_result === 'review'
              ? 'review'
              : 'pending';
      const riskScore = Number(ocrData.risk_score) || 0;
      const complianceScore = Number(ocrData.compliance_score) || 0;

      await updateInspection(inspection.id, {
        status: 'completed',
        overall_result: overallResult,
        risk_score: riskScore,
        compliance_score: complianceScore,
        notes: ocrData.report || `Processed via scan pipeline. ${complianceResults.length} rules checked.`,
        inspected_at: new Date().toISOString(),
      });

      updateState({
        inspection: {
          ...inspection,
          status: 'completed',
          overall_result: overallResult,
          risk_score: riskScore,
          compliance_score: complianceScore,
        },
        progress: 100,
      });

      // Navigate to results page
      router.push(`/results?inspection=${inspection.id}`);

      return { success: true, inspectionId: inspection.id };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      updateState({ step: 'error', error: errorMessage });

      // If inspection was created, mark as failed
      const inspectionToUpdate = currentInspection || inspectionRef.current;
      if (inspectionToUpdate?.id) {
        await updateInspection(inspectionToUpdate.id, {
          status: 'failed',
          notes: `Pipeline failed: ${errorMessage}`,
        });
      }

      return { success: false, error: errorMessage };
    }
  }, [updateState, router]);

  const resetPipeline = useCallback(() => {
    setState({
      step: 'idle',
      inspection: null,
      image: null,
      ocrText: null,
      extractedLabels: null,
      complianceResults: null,
      inexact: false,
      extractionSource: null,
      visionUsed: false,
      visionError: null,
      error: null,
      progress: 0,
    });
  }, []);

  return { state, runFullPipeline, resetPipeline };
}