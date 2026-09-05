import React from 'react';
import { DashboardStats } from '@/types/database';

interface InspectionActivityCardProps {
  stats: DashboardStats;
}

export function InspectionActivityCard({ stats }: InspectionActivityCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_1px_rgba(15,23,42,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700">Inspection Activity (30 Days)</h2>
        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
          {stats.total > 0 ? `Avg ${Math.ceil(stats.total / 30)}/day` : '0/day'}
        </span>
      </div>
      <div className="mt-3 flex h-28 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500">
          {stats.total === 0 ? 'No scan activity in the last 30 days' : `${stats.total} active records recorded`}
        </p>
      </div>
    </section>
  );
}
