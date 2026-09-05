import React from 'react';
import { DashboardStats, Inspection } from '@/types/database';
import { MetricCard } from './MetricCard';
import { ImmediateAttentionCard } from './ImmediateAttentionCard';
import { HighPriorityInspectionsPanel } from './HighPriorityInspectionsPanel';
import { RecentInspectionsTable } from './RecentInspectionsTable';
import { StatusDistributionCard } from './StatusDistributionCard';
import type { FilterStatus } from './RecentInspectionsTable';

interface FigmaPrimaryDashboardProps {
  stats: DashboardStats;
  inspections: Inspection[];
  highPriorityInspections: Inspection[];
  filteredInspections: Inspection[];
  filterStatus: FilterStatus;
  passPercentage: number;
  reviewPercentage: number;
  failPercentage: number;
  onFilterChange: (status: FilterStatus) => void;
  onViewHistory: () => void;
  onOpenEvidence: (inspection: Inspection) => void;
}

export function FigmaPrimaryDashboard({
  stats,
  inspections,
  highPriorityInspections,
  filteredInspections,
  filterStatus,
  passPercentage,
  reviewPercentage,
  failPercentage,
  onFilterChange,
  onViewHistory,
  onOpenEvidence,
}: FigmaPrimaryDashboardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
          <MetricCard label="Official Industry Audits" badge="TOTAL" value={stats.total} detail="Active" />
          <MetricCard label="Compliance Rate" badge="Target" value={`${passPercentage}%`} detail="Statutory target 100%" tone="slate" />
          <MetricCard label="Under Review" badge="Queue" value={stats.needsReview} detail="Pending resolution" tone="amber" />
          <MetricCard label="Total Non-Compliance" badge="Critical" value={stats.nonCompliant} detail="Detected infractions" tone="red" />
        </div>
        <ImmediateAttentionCard count={stats.highPriority} />
      </div>

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-3">
          <HighPriorityInspectionsPanel
            inspections={highPriorityInspections}
            onOpenEvidence={onOpenEvidence}
          />
          <RecentInspectionsTable
            allInspections={inspections}
            inspections={filteredInspections}
            filterStatus={filterStatus}
            onFilterChange={onFilterChange}
            onViewHistory={onViewHistory}
            onOpenEvidence={onOpenEvidence}
          />
        </div>
        <StatusDistributionCard
          stats={stats}
          passPercentage={passPercentage}
          reviewPercentage={reviewPercentage}
          failPercentage={failPercentage}
          filterStatus={filterStatus}
          onFilterChange={onFilterChange}
        />
      </div>
    </div>
  );
}
