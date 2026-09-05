import React from 'react';

interface ImmediateAttentionCardProps {
  count: number;
}

export function ImmediateAttentionCard({ count }: ImmediateAttentionCardProps) {
  return (
    <div className="flex w-full shrink-0 items-center gap-2.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 sm:w-[260px]">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-error text-on-error">
        <span className="material-symbols-outlined text-[14px]">priority_high</span>
      </div>
      <div className="min-w-0 text-[#991B1B]">
        <p className="text-label-bold font-label-bold">Immediate Attention</p>
        <p className="text-body-sm font-body-sm leading-tight">
          {count} critical violations require immediate structural resolution.
        </p>
      </div>
    </div>
  );
}
