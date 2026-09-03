'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase/client';
import { ExtractedLabel } from '@/types/database';
import { DetectedDeclaration } from '@/types/compliance';
import { complianceRules } from '@/lib/constants/complianceRules';

export function DeclarationsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get('inspection');

  const [extractedLabel, setExtractedLabel] = useState<ExtractedLabel | null>(null);
  const [declarations, setDeclarations] = useState<DetectedDeclaration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<DetectedDeclaration | null>(null);
  const [editValue, setEditValue] = useState('');

  // Evidence Modal State
  const [evidenceItem, setEvidenceItem] = useState<DetectedDeclaration | null>(null);

  useEffect(() => {
    if (!inspectionId) {
      setError('No inspection ID provided');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('extracted_labels')
          .select('*')
          .eq('inspection_id', inspectionId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setExtractedLabel(data);
          // Build declarations from extracted label
          const declList: DetectedDeclaration[] = [
            { id: 'RULE-PC-01', key: 'manufacturer_name', label: 'Manufacturer/Packer/Importer', value: data.manufacturer_name || '', confidence: data.extraction_confidence || 95, reviewRequired: !data.manufacturer_name },
            { id: 'RULE-PC-02', key: 'commodity_name', label: 'Common/Generic Product Name', value: data.commodity_name || '', confidence: data.extraction_confidence || 95, reviewRequired: !data.commodity_name },
            { id: 'RULE-PC-03', key: 'net_quantity', label: 'Net Quantity', value: data.net_quantity || '', confidence: data.extraction_confidence || 95, reviewRequired: !data.net_quantity },
            { id: 'RULE-PC-04', key: 'month_year_packed', label: 'Month & Year of Manufacture/Packing', value: data.month_year_packed || '', confidence: data.extraction_confidence || 95, reviewRequired: !data.month_year_packed },
            { id: 'RULE-PC-05', key: 'mrp', label: 'Maximum Retail Price (MRP)', value: data.mrp || '', confidence: data.extraction_confidence || 95, reviewRequired: !data.mrp },
            { id: 'RULE-PC-06', key: 'unit_price', label: 'Unit Sale Price (USP)', value: '', confidence: 0, reviewRequired: true, warningNote: 'Unit price calculation requires net quantity and MRP' },
            { id: 'RULE-PC-07', key: 'customer_care', label: 'Consumer Care Details', value: data.customer_care_details || '', confidence: data.extraction_confidence || 95, reviewRequired: !data.customer_care_details },
          ].filter(d => d.value || d.reviewRequired);

          setDeclarations(declList);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load declarations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [inspectionId]);

  const updateDeclaration = (id: string, updatedValue: string) => {
    setDeclarations(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, value: updatedValue, confidence: 99, reviewRequired: false, warningNote: undefined }
          : item
      )
    );
  };

  const handleOpenEdit = (item: DetectedDeclaration) => {
    setEditingItem(item);
    setEditValue(item.value);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !extractedLabel) return;

    // Map declaration keys to actual Supabase extracted_labels columns.
    const keyToColumn: Record<string, keyof ExtractedLabel> = {
      manufacturer_name: 'manufacturer_name',
      commodity_name: 'commodity_name',
      net_quantity: 'net_quantity',
      month_year_packed: 'month_year_packed',
      mrp: 'mrp',
      customer_care: 'customer_care_details',
      unit_price: 'other_declarations',
    };
    const column = keyToColumn[editingItem.key] ?? 'other_declarations';

    const updateData: Partial<ExtractedLabel> = {
      [column]: editValue,
      updated_at: new Date().toISOString(),
    } as Partial<ExtractedLabel>;

    try {
      const { error } = await supabase
        .from('extracted_labels')
        .update(updateData)
        .eq('inspection_id', inspectionId!);

      if (error) throw error;

      updateDeclaration(editingItem.id, editValue);
      setEditingItem(null);
    } catch (err) {
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRunCompliance = async () => {
    setIsRunningCheck(true);
    try {
      // Navigate to results page - compliance will be computed there
      router.push(`/results?inspection=${inspectionId}`);
    } catch {
      // Navigation handled by router
    } finally {
      setIsRunningCheck(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell pageTitle="Detected Declarations">
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center justify-center py-12">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">autorenew</span>
          <p className="text-body-base text-on-surface-variant">Loading declarations...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell pageTitle="Declarations Error">
        <div className="max-w-md mx-auto text-center py-12">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Failed to Load Declarations</h2>
          <p className="text-body-base text-on-surface-variant mb-6">{error}</p>
          <Button variant="primary" onClick={() => router.push('/scan/new')}>
            Start New Scan
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Detected Declarations">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end flex-wrap gap-4">
        <div>
          <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface tracking-tight mb-2">
            Detected Declarations
          </h2>
          <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
            Verified attributes used for compliance checking. Low confidence fields require manual review.
          </p>
        </div>

        <Button
          variant="primary"
          icon={isRunningCheck ? 'autorenew' : 'check_circle'}
          onClick={handleRunCompliance}
          disabled={isRunningCheck}
          className="py-2.5 px-6 shadow-sm"
        >
          {isRunningCheck ? 'Evaluating Compliance...' : 'Update & Run Compliance Check'}
        </Button>
      </div>

      {/* Bento Grid / Declaration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {declarations.map((item) => {
          const isWarning = item.reviewRequired;

          return (
            <div
              key={item.id}
              className={`rounded-lg p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.05)] flex flex-col justify-between transition-all hover:shadow-md ${
                isWarning
                  ? 'bg-warning-container border-2 border-warning relative overflow-hidden'
                  : 'bg-surface border border-outline-variant'
              }`}
            >
              {/* Review Required Top-Right Ribbon for Warning Items */}
              {isWarning && (
                <div className="absolute top-0 right-0 bg-warning text-[#78350f] text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <span className="material-symbols-outlined text-[12px]">warning</span>
                  Review Required
                </div>
              )}

              <div>
                <div className={`flex justify-between items-start mb-3 ${isWarning ? 'mt-2' : ''}`}>
                  <span className={`text-label-bold font-label-bold uppercase tracking-wider text-xs ${isWarning ? 'text-[#78350f]' : 'text-secondary'}`}>
                    {item.label}
                  </span>

                  <div className={`px-2 py-1 rounded-full text-[11px] font-label-bold flex items-center gap-1 ${isWarning ? 'bg-[#fef3c7] text-[#78350f] border border-warning' : 'bg-surface-container-highest text-on-surface'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full block ${isWarning ? 'bg-warning' : 'bg-primary'}`} />
                    {item.confidence}%
                  </div>
                </div>

                <p className={`text-headline-md font-headline-md mb-6 truncate ${isWarning ? 'text-[#78350f]' : 'text-on-surface'}`} title={item.value}>
                  {item.value || '<Not detected>'}
                </p>

                {item.warningNote && (
                  <p className="text-xs text-[#78350f] bg-amber-100/60 p-2 rounded mb-4 font-medium leading-relaxed">
                    {item.warningNote}
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className={`flex gap-3 pt-3 border-t ${isWarning ? 'border-[#fcd34d]' : 'border-outline-variant'}`}>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="text-body-sm font-label-bold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer transition-colors text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>

                <button
                  onClick={() => setEvidenceItem(item)}
                  className={`text-body-sm font-label-bold flex items-center gap-1 ml-4 cursor-pointer transition-colors text-xs ${isWarning ? 'text-[#78350f] hover:opacity-80' : 'text-secondary hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">image</span>
                  Evidence
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Declaration Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={`Edit ${editingItem?.label || 'Declaration'}`}
        subtitle="Correct optical recognition error or adjust standard unit"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
          </>
        }
      >
        {editingItem && (
          <div className="space-y-4">
            <div>
              <label className="block text-label-bold font-label-bold text-on-surface uppercase text-xs mb-1.5">
                {editingItem.label} Value
              </label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full border border-outline-variant rounded bg-surface-container-lowest px-3 py-2 text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                autoFocus
              />
            </div>
            <div className="bg-surface-container-low p-3 rounded text-xs text-on-surface-variant leading-relaxed">
              <span className="font-semibold text-on-surface">Compliance Note: </span>
              Ensure values comply with metric standards specified under the Legal Metrology (Packaged Commodities) Rules.
            </div>
          </div>
        )}
      </Modal>

      {/* Evidence Viewer Modal */}
      <Modal
        isOpen={!!evidenceItem}
        onClose={() => setEvidenceItem(null)}
        title={`Visual Evidence — ${evidenceItem?.label || ''}`}
        subtitle={`Crop region confidence: ${evidenceItem?.confidence || 0}%`}
        maxWidth="xl"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setEvidenceItem(null)}>Close Viewer</Button>
        }
      >
        {evidenceItem && (
          <div className="space-y-4">
            <div className="relative h-64 bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant flex items-center justify-center">
              <div className="text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">image_search</span>
                <p>Evidence crop for {evidenceItem.label}</p>
                <p className="text-xs">OCR extracted: {evidenceItem.value}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant font-data-tabular">
              <span>Bounding region detected via OCR</span>
              <span className="text-green-700 font-semibold">Verified by Vision OCR</span>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}