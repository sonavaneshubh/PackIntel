import React from 'react';
import { Inspection } from '@/types/database';
import { StatusBadge, RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export type FilterStatus = 'ALL' | 'FAIL' | 'REVIEW' | 'PASS';

interface RecentInspectionsTableProps {
  allInspections: Inspection[];
  inspections: Inspection[];
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  onViewHistory: () => void;
  onOpenEvidence: (inspection: Inspection) => void;
}

const filterLabels: Record<FilterStatus, string> = {
  ALL: 'All Scans',
  FAIL: 'Potential Non-Compliance',
  REVIEW: 'Needs Review',
  PASS: 'Compliant',
};

export function RecentInspectionsTable({
  allInspections,
  inspections,
  filterStatus,
  onFilterChange,
  onViewHistory,
  onOpenEvidence,
}: RecentInspectionsTableProps) {
  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_1px_1px_rgba(25,28,29,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-headline-md font-headline-md text-on-surface">Recent Inspections</h2>
          <p className="mt-0.5 text-body-sm font-body-sm text-on-surface-variant">Audit records from field operations and automated visual checks.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewHistory} className="shrink-0 px-1 text-body-sm text-[#0F766E]">
          View History →
        </Button>
      </div>

      <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
        {(Object.keys(filterLabels) as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              filterStatus === status
                ? 'border border-[#0D9488] bg-[#CCFBF1] text-[#0F766E]'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {filterLabels[status]}
            <span className={`rounded px-1.5 py-0.5 text-[10px] ${filterStatus === status ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {status === 'ALL' ? allInspections.length : allInspections.filter((item) => (item.overall_result || '').toUpperCase() === status).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-x-auto">
        {inspections.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center text-on-surface-variant">
            <span className="material-symbols-outlined mb-2 text-3xl text-outline">content_paste_search</span>
            <p className="text-body-base font-label-bold text-on-surface">No inspections found.</p>
            <p className="mt-1 text-body-sm font-body-sm">Try changing your status filter or scan a new product.</p>
          </div>
        ) : (
          <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
              <tr className="bg-surface-container-low text-label-bold font-label-bold uppercase text-on-surface-variant">
                <th className="p-2">Product</th>
                <th className="p-2">Manufacturer</th>
                <th className="w-[120px] p-2">Scan Date</th>
                <th className="w-[100px] p-2">Status</th>
                <th className="w-[100px] p-2">Risk</th>
                <th className="w-20 p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => {
                const result = (inspection.overall_result || 'pending').toUpperCase();
                const status = result === 'PASS' ? 'PASS' : result === 'REVIEW' ? 'REVIEW' : result === 'FAIL' ? 'FAIL' : 'pending';
                const riskScore = inspection.risk_score ?? (status === 'FAIL' ? 85 : status === 'REVIEW' ? 50 : 10);
                return (
                  <tr key={inspection.id} className="border-b border-outline-variant text-body-sm font-body-sm text-on-surface-variant">
                    <td className="p-2">
                      <div className="max-w-[180px] font-label-bold leading-tight text-on-surface">{inspection.product_name || 'Unknown Product'}</div>
                      <span className="text-body-sm font-body-sm text-on-surface-variant">ID: {inspection.inspection_number}</span>
                    </td>
                    <td className="p-2">{inspection.manufacturer_name || 'N/A'}</td>
                    <td className="p-2">{new Date(inspection.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-2"><StatusBadge status={status} /></td>
                    <td className="p-2"><RiskBadge score={riskScore} showScore={false} /></td>
                    <td className="p-2 text-right">
                      <Button variant={status === 'REVIEW' ? 'primary' : 'outline'} size="sm" onClick={() => onOpenEvidence(inspection)}>
                        {status === 'REVIEW' ? 'Analyze' : 'Details'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
