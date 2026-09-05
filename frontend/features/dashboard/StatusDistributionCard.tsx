import React from 'react';
import { DashboardStats } from '@/types/database';

type FilterStatus = 'ALL' | 'FAIL' | 'REVIEW' | 'PASS';

interface StatusDistributionCardProps {
  stats: DashboardStats;
  passPercentage: number;
  reviewPercentage: number;
  failPercentage: number;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
}

export function StatusDistributionCard({
  stats,
  passPercentage,
  reviewPercentage,
  failPercentage,
  filterStatus,
  onFilterChange,
}: StatusDistributionCardProps) {
  const legend = [
    { status: 'PASS' as const, label: 'Compliant (Full statutory pass)', count: stats.compliant, color: 'bg-[#0D9488]' },
    { status: 'REVIEW' as const, label: 'Needs Review (Ambiguous)', count: stats.needsReview, color: 'bg-warning' },
    { status: 'FAIL' as const, label: 'Non-Compliant', count: stats.nonCompliant, color: 'bg-error' },
  ];

  return (
    <aside className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_1px_1px_rgba(25,28,29,0.04)]">
      <h2 className="text-headline-md font-headline-md text-on-surface">Status Distribution</h2>
      <p className="mt-0.5 text-body-sm font-body-sm text-on-surface-variant">Total parsed statutory scans.</p>

      <div className="flex h-40 items-center justify-center">
        <div
          className="relative flex size-[120px] items-center justify-center rounded-full"
          style={{ background: stats.total > 0 ? `conic-gradient(#F59E0B 0% ${reviewPercentage}%, #0D9488 ${reviewPercentage}% ${reviewPercentage + passPercentage}%, #BA1A1A ${reviewPercentage + passPercentage}% 100%)` : '#E1E3E4' }}
        >
          <div className="flex size-[92px] flex-col items-center justify-center rounded-full bg-surface-container-lowest">
            <span className="text-2xl font-bold text-on-surface">{stats.total}</span>
            <span className="text-label-bold font-label-bold uppercase text-on-surface-variant">Total Scans</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {legend.map((item) => (
          <button
            key={item.status}
            onClick={() => onFilterChange(filterStatus === item.status ? 'ALL' : item.status)}
            className={`flex items-center gap-2 rounded px-1 text-left text-body-sm font-body-sm text-on-surface-variant transition-colors ${filterStatus === item.status ? 'bg-surface-container-low font-label-bold' : 'hover:bg-surface-container-low'}`}
          >
            <span className={`size-2 shrink-0 rounded-full ${item.color}`} />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <span className="font-label-bold text-on-surface">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="my-3 border-t border-outline-variant" />
      <div className="flex items-start gap-2 text-body-sm font-body-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[14px] text-[#0D9488]">info</span>
        <p>All active statutory scans are synchronized with Rule Engine database.</p>
      </div>
    </aside>
  );
}
