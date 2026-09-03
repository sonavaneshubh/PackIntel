import React from 'react';
import { cn } from '@/lib/utils';
import { ComplianceStatus } from '@/types/compliance';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: ComplianceStatus;
  variant?: 'pill' | 'outline' | 'subtle';
  children?: React.ReactNode;
}

export function StatusBadge({
  status = 'PASS',
  className,
  children,
  ...props
}: BadgeProps) {
  // Normalize all accepted statuses:
  // PASS → good, FAIL → error, REVIEW → warning, DRAFT / NOT_APPLICABLE → pending
  const normalized = String(status).toUpperCase();
  const isPass = normalized === 'PASS' || normalized === 'GOOD';
  const isReview = normalized === 'REVIEW' || normalized === 'WARNING';
  const isFail = normalized === 'FAIL' || normalized === 'ERROR';
  const isPending =
    normalized === 'PENDING' ||
    normalized === 'DRAFT' ||
    normalized === 'NOT_APPLICABLE';

  let badgeStyle = 'bg-green-50 text-green-700 border-green-200';
  let dotColor = 'bg-green-500';

  if (isReview) {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (isFail) {
    badgeStyle = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
  } else if (isPending || !isPass) {
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

export function RiskBadge({
  score,
  level,
  showScore = true,
  className,
}: {
  score?: number;
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  showScore?: boolean;
  className?: string;
}) {
  const computedLevel =
    level ||
    (score !== undefined
      ? score <= 25
        ? 'LOW'
        : score <= 50
        ? 'MEDIUM'
        : score <= 75
        ? 'HIGH'
        : 'CRITICAL'
      : 'LOW');

  const configs = {
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: 'verified_user',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: 'info',
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
      icon: 'warning',
    },
    CRITICAL: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-600',
      icon: 'gpp_bad',
    },
  };

  const config = configs[computedLevel];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-label-bold font-semibold border shadow-2xs',
        config.bg,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {showScore && score !== undefined && (
        <span className="font-mono font-bold">{score}/100</span>
      )}
      {showScore && score !== undefined && <span className="text-outline/60">•</span>}
      <span>{computedLevel}</span>
    </span>
  );
}

