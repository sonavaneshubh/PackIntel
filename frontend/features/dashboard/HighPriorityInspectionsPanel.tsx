import React from 'react';
import { Inspection } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { RiskBadge } from '@/components/ui/Badge';

interface HighPriorityInspectionsPanelProps {
  inspections: Inspection[];
  onOpenEvidence: (inspection: Inspection) => void;
}

export function HighPriorityInspectionsPanel({
  inspections,
  onOpenEvidence,
}: HighPriorityInspectionsPanelProps) {
  return (
    <section
      id="high-priority"
      className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_1px_1px_rgba(25,28,29,0.04)]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-md font-headline-md text-on-surface">High-Priority Inspections</h2>
          <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-label-bold font-label-bold text-on-surface-variant">
            {inspections.length} Products Requiring Action
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-body-sm font-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-error" />Critical (76-100)</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-warning" />High (51-75)</span>
        </div>
      </div>
      <p className="mt-2 text-body-sm font-body-sm text-on-surface-variant">
        Products requiring immediate investigation based on explainable risk scores and potential statutory violations.
      </p>

      {inspections.length === 0 ? (
        <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-md bg-surface-container-low py-8 text-center">
          <span className="material-symbols-outlined text-2xl text-[#0D9488]">verified_user</span>
          <p className="text-body-sm font-label-bold text-on-surface">No High-Priority Inspections</p>
          <p className="text-body-sm font-body-sm text-on-surface-variant">There are currently no high-risk items requiring immediate investigation.</p>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-outline-variant rounded-md border border-outline-variant">
          {inspections.map((inspection) => (
            <div key={inspection.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-body-base font-label-bold text-on-surface">{inspection.product_name || 'Unknown Product'}</h3>
                  <RiskBadge score={inspection.risk_score ?? 85} showScore={false} />
                </div>
                <p className="mt-1 text-body-sm font-body-sm text-on-surface-variant">Manufacturer: {inspection.manufacturer_name || 'N/A'}</p>
              </div>
              <Button variant="primary" size="sm" icon="visibility" onClick={() => onOpenEvidence(inspection)}>
                View Evidence
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
