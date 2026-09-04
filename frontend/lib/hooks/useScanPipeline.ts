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
import { complianceRules } from '@/lib/constants/complianceRules';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ScanPipelineState {
  step: 'idle' | 'creating' | 'uploading' | 'ocr' | 'extracting' | 'compliance' | 'completed' | 'error';
  inspection: Inspection | null;
  image: InspectionImage | null;
  ocrText: string | null;
  extractedLabels: ExtractedLabelInsert | null;
  complianceResults: ComplianceResultInsert[] | null;
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

      updateState({ ocrText, step: 'extracting', progress: 50 });

      // Step 4: Save OCR text to inspection_images
      if (image.id) {
        await supabase
          .from('inspection_images')
          .update({ ocr_text: ocrText })
          .eq('id', image.id);
      }

      // Step 5: Save extracted labels
      const labelData: ExtractedLabelInsert = {
        inspection_id: inspection.id,
        manufacturer_name: extractedDeclarations.manufacturer_name || null,
        packer_name: extractedDeclarations.packer_name || null,
        importer_name: extractedDeclarations.importer_name || null,
        commodity_name: extractedDeclarations.common_generic_name || extractedDeclarations.commodity_name || null,
        net_quantity: extractedDeclarations.net_quantity || null,
        mrp: extractedDeclarations.mrp || null,
        month_year_packed: extractedDeclarations.mfg_date || extractedDeclarations.month_year_packed || null,
        customer_care_details: extractedDeclarations.consumer_care || extractedDeclarations.customer_care_details || null,
        country_of_origin: extractedDeclarations.country_of_origin || null,
        other_declarations: extractedDeclarations.other_declarations || null,
        raw_ocr_text: ocrText,
        extraction_confidence: ocrData.confidence_score || 95,
      };

      const { data: savedLabel, error: labelError } = await saveExtractedLabel(labelData);
      if (labelError) throw new Error(labelError);

      updateState({ extractedLabels: savedLabel, step: 'compliance', progress: 70 });

      // Step 6: Run compliance checks using frontend rules
      const complianceResults: ComplianceResultInsert[] = complianceRules.map(rule => {
        let result: 'pass' | 'fail' | 'warning' | 'not_applicable' = 'pass';
        let explanation = '';
        let extractedValue = '';

        switch (rule.id) {
          case 'RULE-PC-01': // Manufacturer/Packer/Importer
            extractedValue = labelData.manufacturer_name || labelData.packer_name || labelData.importer_name || '';
            result = extractedValue ? 'pass' : 'fail';
            explanation = extractedValue
              ? `Complete name and address identified: ${extractedValue}`
              : 'Missing manufacturer/packer/importer name and address';
            break;
          case 'RULE-PC-02': // Common/Generic Name
            extractedValue = labelData.commodity_name || '';
            result = extractedValue ? 'pass' : 'fail';
            explanation = extractedValue
              ? `Generic name declared: ${extractedValue}`
              : 'Missing common/generic product name';
            break;
          case 'RULE-PC-03': // Net Quantity
            extractedValue = labelData.net_quantity || '';
            result = extractedValue ? 'pass' : 'fail';
            explanation = extractedValue
              ? `Net quantity declared: ${extractedValue}`
              : 'Missing net quantity in standard units';
            break;
          case 'RULE-PC-04': // Month/Year of Manufacture
            extractedValue = labelData.month_year_packed || '';
            result = extractedValue ? 'pass' : 'fail';
            explanation = extractedValue
              ? `Manufacture/packing date: ${extractedValue}`
              : 'Missing month and year of manufacture/packing';
            break;
          case 'RULE-PC-05': // MRP
            extractedValue = labelData.mrp || '';
            result = extractedValue ? 'pass' : 'fail';
            explanation = extractedValue
              ? `MRP declared: ${extractedValue}`
              : 'Missing Maximum Retail Price (MRP)';
            break;
          case 'RULE-PC-06': // Unit Sale Price
            result = 'not_applicable';
            explanation = 'Unit sale price verification requires price per unit calculation';
            break;
          case 'RULE-PC-07': // Consumer Care
            extractedValue = labelData.customer_care_details || '';
            result = extractedValue ? 'pass' : 'warning';
            explanation = extractedValue
              ? `Consumer care details: ${extractedValue}`
              : 'Consumer care contact details not found (warning)';
            break;
          default:
            result = 'not_applicable';
            explanation = 'Rule not implemented';
        }

        return {
          inspection_id: inspection.id,
          rule_code: rule.id,
          rule_name: rule.name,
          requirement: rule.clause,
          extracted_value: extractedValue,
          result,
          explanation,
          evidence: ocrText ? `OCR text contains: ${extractedValue}` : 'No OCR text available',
        };
      });

      const { error: complianceError } = await saveComplianceResults(complianceResults);
      if (complianceError) throw new Error(complianceError);

      updateState({ complianceResults, step: 'completed', progress: 90 });

      // Step 7: Calculate overall result and update inspection
      const failedCount = complianceResults.filter(r => r.result === 'fail').length;
      const warningCount = complianceResults.filter(r => r.result === 'warning').length;

      let overallResult: 'pass' | 'fail' | 'review' | 'pending' = 'pending';
      let riskScore = 0;

      if (
        ocrData.score === 0 &&
        (ocrData.status === 'insufficient_information' ||
          ocrData.image_quality === 'poor' ||
          ocrData.image_quality === 'unusable')
      ) {
        overallResult = 'review';
        riskScore = 0;
      } else if (failedCount > 0) {
        overallResult = 'fail';
        riskScore = Math.min(100, 60 + failedCount * 15);
      } else if (warningCount > 0) {
        overallResult = 'review';
        riskScore = Math.min(60, 20 + warningCount * 10);
      } else {
        overallResult = 'pass';
        riskScore = 5;
      }

      await updateInspection(inspection.id, {
        status: 'completed',
        overall_result: overallResult,
        risk_score: riskScore,
        notes: ocrData.report || `Processed via scan pipeline. ${complianceResults.length} rules checked.`,
        inspected_at: new Date().toISOString(),
      });

      updateState({
        inspection: { ...inspection, status: 'completed', overall_result: overallResult, risk_score: riskScore },
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
      error: null,
      progress: 0,
    });
  }, []);

  return { state, runFullPipeline, resetPipeline };
}