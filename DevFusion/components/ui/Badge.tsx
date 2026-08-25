import React from 'react';
import { cn } from '@/lib/utils';
import { ComplianceStatus } from '@/types/compliance';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: ComplianceStatus | 'good' | 'warning' | 'error' | 'pending';
  variant?: 'pill' | 'outline' | 'subtle';
  children?: React.ReactNode;
}

export function StatusBadge({
  status = 'PASS',
  className,
  children,
  ...props
}: BadgeProps) {
  let badgeStyle = 'bg-green-50 text-green-700 border-green-200';
  let dotColor = 'bg-green-500';

  if (status === 'REVIEW' || status === 'warning') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (status === 'FAIL' || status === 'error') {
    badgeStyle = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
  } else if (status === 'pending') {
    badgeStyle = 'bg-surface-container-highest text-on-surface-variant border-outline-variant';
    dotColor = 'bg-outline';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-bold font-label-bold border',
        badgeStyle,
        className
      )}
      {...props}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
      {children || status}
    </span>
  );
}

export function ConfidenceBadge({
  confidence,
  className,
}: {
  confidence: number;
  className?: string;
}) {
  const isHigh = confidence >= 90;
  const isMed = confidence >= 80 && confidence < 90;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-label-bold',
        isHigh
          ? 'bg-green-100 text-green-800'
          : isMed
          ? 'bg-orange-100 text-orange-800'
          : 'bg-red-100 text-red-800',
        className
      )}
    >
      <span className="material-symbols-outlined text-[14px]">
        {isHigh ? 'check_circle' : isMed ? 'warning' : 'error'}
      </span>
      {confidence}%
    </span>
  );
}
