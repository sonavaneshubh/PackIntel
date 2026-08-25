'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useCompliance } from '@/lib/complianceContext';
import { DetectedDeclaration } from '@/types/compliance';

export function DeclarationsView() {
  const router = useRouter();
  const { declarations, updateDeclaration } = useCompliance();

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<DetectedDeclaration | null>(null);
  const [editValue, setEditValue] = useState('');

  // Evidence Modal State
  const [evidenceItem, setEvidenceItem] = useState<DetectedDeclaration | null>(null);

  // Compliance Run State
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  const handleOpenEdit = (item: DetectedDeclaration) => {
    setEditingItem(item);
    setEditValue(item.value);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      updateDeclaration(editingItem.id, editValue);
      setEditingItem(null);
    }
  };

  const handleRunCompliance = () => {
    setIsRunningCheck(true);
    setTimeout(() => {
      setIsRunningCheck(false);
      router.push('/results');
    }, 1200);
  };

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
                  <span className="material-symbols-outlined text-[12px]">
                    warning
                  </span>
                  Review Required
                </div>
              )}

              <div>
                <div
                  className={`flex justify-between items-start mb-3 ${
                    isWarning ? 'mt-2' : ''
                  }`}
                >
                  <span
                    className={`text-label-bold font-label-bold uppercase tracking-wider text-xs ${
                      isWarning ? 'text-[#78350f]' : 'text-secondary'
                    }`}
                  >
                    {item.label}
                  </span>

                  <div
                    className={`px-2 py-1 rounded-full text-[11px] font-label-bold flex items-center gap-1 ${
                      isWarning
                        ? 'bg-[#fef3c7] text-[#78350f] border border-warning'
                        : 'bg-surface-container-highest text-on-surface'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full block ${
                        isWarning ? 'bg-warning' : 'bg-primary'
                      }`}
                    />
                    {item.confidence}%
                  </div>
                </div>

                <p
                  className={`text-headline-md font-headline-md mb-6 truncate ${
                    isWarning ? 'text-[#78350f]' : 'text-on-surface'
                  }`}
                  title={item.value}
                >
                  {item.value}
                </p>

                {item.warningNote && (
                  <p className="text-xs text-[#78350f] bg-amber-100/60 p-2 rounded mb-4 font-medium leading-relaxed">
                    {item.warningNote}
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div
                className={`flex gap-3 pt-3 border-t ${
                  isWarning ? 'border-[#fcd34d]' : 'border-outline-variant'
                }`}
              >
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="text-body-sm font-label-bold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer transition-colors text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    edit
                  </span>
                  Edit
                </button>

                <button
                  onClick={() => setEvidenceItem(item)}
                  className={`text-body-sm font-label-bold flex items-center gap-1 ml-4 cursor-pointer transition-colors text-xs ${
                    isWarning
                      ? 'text-[#78350f] hover:opacity-80'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    image
                  </span>
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditingItem(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Save Changes
            </Button>
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEvidenceItem(null)}
          >
            Close Viewer
          </Button>
        }
      >
        {evidenceItem && (
          <div className="space-y-4">
            <div className="relative h-64 bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant flex items-center justify-center">
              <img
                src={evidenceItem.evidenceImageUrl || '/images/label_sample.png'}
                alt={`Evidence crop for ${evidenceItem.label}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/10 border-2 border-primary m-6 rounded flex items-start justify-start p-2 pointer-events-none">
                <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                  {evidenceItem.label}: {evidenceItem.value}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant font-data-tabular">
              <span>Bounding Coordinates: [x: 120, y: 340, w: 210, h: 48]</span>
              <span className="text-green-700 font-semibold">Verified by Vision OCR</span>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
