import React from 'react';

interface MetricCardProps {
  label: string;
  badge: string;
  value: string | number;
  detail: string;
  tone?: 'teal' | 'slate' | 'amber' | 'red';
}

const badgeStyles = {
  teal: 'bg-[#CCFBF1] text-[#0F766E]',
  slate: 'bg-surface-container-highest text-on-surface-variant',
  amber: 'bg-warning-container text-[#78350F]',
  red: 'bg-[#FEE2E2] text-[#991B1B]',
};

export function MetricCard({ label, badge, value, detail, tone = 'teal' }: MetricCardProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_1px_1px_rgba(25,28,29,0.04)]">
      <div className="flex w-full items-center justify-between gap-2">
        <span className="truncate text-label-bold font-label-bold uppercase text-on-surface-variant">{label}</span>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-label-bold ${badgeStyles[tone]}`}>
          {badge}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-2xl font-bold text-on-surface">{value}</span>
        <span className="truncate text-body-sm font-body-sm text-on-surface-variant">{detail}</span>
      </div>
    </div>
  );
}
