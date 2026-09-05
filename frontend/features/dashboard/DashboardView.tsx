'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge, RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDashboardStats, useMyInspections } from '@/lib/hooks/useSupabaseData';
import { Inspection } from '@/types/database';
import { EvidenceDetails } from '@/types';
import { EvidenceModal } from './EvidenceModal';
import { FigmaPrimaryDashboard } from './FigmaPrimaryDashboard';
import { InspectionActivityCard } from './InspectionActivityCard';
import type { FilterStatus } from './RecentInspectionsTable';

export function DashboardView() {
  const router = useRouter();
  const {
    stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    inspections,
    isLoading: isLoadingInspections,
    error: inspectionsError,
    refetch: refetchInspections,
  } = useMyInspections();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceDetails | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  const handleOpenScanEvidence = (scan: Inspection) => {
    const isFail = scan.overall_result === 'fail';
    const isReview = scan.overall_result === 'review';

    setSelectedEvidence({
      id: `EVD-${scan.inspection_number}`,
      productName: scan.product_name ?? 'Unknown Product',
      attribute: 'Statutory Declarations',
      detectedValue: `Category: ${scan.product_category ?? 'N/A'} | Manufacturer: ${scan.manufacturer_name ?? 'N/A'}`,
      ocrConfidence: 95,
      applicableRule: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)',
      ruleVersion: 'v2.4.1 Active',
      detectedIssue: isFail
        ? 'Detected statutory compliance violation on product label.'
        : isReview
          ? 'Ambiguous declaration or low confidence fields require manual review.'
          : 'All statutory declarations verified compliant with Legal Metrology Rules.',
      explanation: 'Official screening record stored in Supabase database.',
      complianceStatus: isFail ? 'FAIL' : isReview ? 'REVIEW' : 'PASS',
      riskScore: scan.risk_score ?? (isFail ? 85 : (isReview ? 50 : 10)),
      riskLevel:
        (scan.risk_score || 0) >= 76
          ? 'CRITICAL'
          : (scan.risk_score || 0) >= 51
            ? 'HIGH'
            : 'LOW',
      riskReasons: isFail
        ? ['Detected statutory non-compliance in declarations']
        : isReview
          ? ['Verification recommended before market dispatch']
          : ['Statutory requirements fully satisfied'],
      imageUrl:
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      boundingRegion: {
        top: '35%',
        left: '25%',
        width: '50%',
        height: '25%',
        label: 'Verified Statutory Region',
      },
    });
    setIsEvidenceModalOpen(true);
  };

  // Percentages for Donut Chart & Cards
  const passPercentage =
    stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
  const reviewPercentage =
    stats.total > 0 ? Math.round((stats.needsReview / stats.total) * 100) : 0;
  const failPercentage =
    stats.total > 0 ? Math.round((stats.nonCompliant / stats.total) * 100) : 0;

  // High Priority items (risk score >= 76 or status = fail)
  const highPriorityInspections = inspections.filter(
    (item) =>
      (item.risk_score ?? 0) >= 76 || (item.overall_result || '').toLowerCase() === 'fail'
  );

  // Filtered recent inspections
  const filteredInspections = inspections.filter((scan) => {
    if (filterStatus === 'ALL') return true;
    const res = (scan.overall_result || '').toUpperCase();
    if (filterStatus === 'PASS') return res === 'PASS';
    if (filterStatus === 'REVIEW') return res === 'REVIEW';
    if (filterStatus === 'FAIL') return res === 'FAIL';
    return true;
  });

  const isLoading = isLoadingStats || isLoadingInspections;
  const hasError = statsError || inspectionsError;

  return (
    <AppShell pageTitle="PackIntel Dashboard">
      {/* Evidence Inspection Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        isOpen={isEvidenceModalOpen}
        onClose={() => {
          setIsEvidenceModalOpen(false);
          setSelectedEvidence(null);
        }}
      />

      {/* Top Header Section */}
      <div className="hidden flex-col md:flex-row md:items-center justify-between mb-6 gap-4 pb-4 border-b border-outline-variant/60">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface">
              PackIntel Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-label-bold bg-green-50 text-green-700 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Operational
            </span>
          </div>
          <p className="text-body-base font-body-base text-on-surface-variant mt-1">
            PackIntel – AI-Powered Packaged Commodity Compliance Intelligence •{' '}
            <span className="text-primary font-medium">
              Scan. Verify. Compare. Detect. Prioritize.
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push('/history')}
            className="shadow-xs"
            icon="history"
          >
            View Scan History
          </Button>
          <Button
            variant="primary"
            icon="add"
            onClick={() => router.push('/scan/new')}
            className="shadow-xs"
          >
            + Start New Scan
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 min-h-[350px] bg-surface border border-outline-variant rounded-xl mb-8">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-3">
            autorenew
          </span>
          <p className="text-sm font-semibold text-on-surface">
            Loading inspection data...
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && hasError && (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-red-50/50 border border-red-200 rounded-xl mb-8">
          <span className="material-symbols-outlined text-4xl text-red-600 mb-2">
            error
          </span>
          <h3 className="text-lg font-bold text-on-surface mb-1">
            Unable to load inspection data.
          </h3>
          <p className="text-xs text-on-surface-variant mb-4 text-center max-w-md">
            {statsError || inspectionsError || 'Failed to fetch database records from Supabase.'}
          </p>
          <Button
            variant="primary"
            icon="refresh"
            onClick={() => {
              refetchStats();
              refetchInspections();
            }}
          >
            Retry Loading Data
          </Button>
        </div>
      )}

      {/* Main Dashboard Content (rendered when loaded & error-free) */}
      {!isLoading && !hasError && (
        <>
          <FigmaPrimaryDashboard
            stats={stats}
            inspections={inspections}
            highPriorityInspections={highPriorityInspections}
            filteredInspections={filteredInspections}
            filterStatus={filterStatus}
            passPercentage={passPercentage}
            reviewPercentage={reviewPercentage}
            failPercentage={failPercentage}
            onFilterChange={setFilterStatus}
            onViewHistory={() => router.push('/history')}
            onOpenEvidence={handleOpenScanEvidence}
          />

          <InspectionActivityCard stats={stats} />

          {/* Top KPI Cards (5 cards) */}
          <div className="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
            {/* Card 1: Total Inspections */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-label-bold text-on-surface-variant uppercase tracking-wider">
                    Total Inspections
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    analytics
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-sans text-on-surface">
                    {stats.total.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    {stats.total > 0 ? 'Active' : '0%'}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-on-surface-variant">
                Official statutory audits
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
            </div>

            {/* Card 2: Compliant */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-label-bold text-green-800 uppercase tracking-wider">
                    Compliant
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-green-600">
                    check_circle
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-sans text-on-surface">
                    {stats.compliant}
                  </span>
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                    {passPercentage}%
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-on-surface-variant">
                Full statutory pass
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500" />
            </div>

            {/* Card 3: Needs Review */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-label-bold text-amber-800 uppercase tracking-wider">
                    Needs Review
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-amber-500">
                    warning
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-sans text-on-surface">
                    {stats.needsReview}
                  </span>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    {reviewPercentage}%
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-on-surface-variant">
                Ambiguous or low confidence
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400" />
            </div>

            {/* Card 4: Potential Non-Compliance */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-label-bold text-red-800 uppercase tracking-wider">
                    Potential Non-Compliance
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-red-600">
                    error
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-sans text-on-surface">
                    {stats.nonCompliant}
                  </span>
                  <span className="text-xs font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                    {failPercentage}%
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-on-surface-variant">
                Detected statutory violations
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500" />
            </div>

            {/* Card 5: High Priority */}
            <div className="bg-surface border-2 border-red-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between bg-red-50/20">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-label-bold text-red-800 uppercase tracking-wider font-bold">
                    High Priority
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-red-700 animate-bounce">
                    priority_high
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-sans text-red-700">
                    {stats.highPriority}
                  </span>
                  <span className="text-[11px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    Immediate
                  </span>
                </div>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-red-800">
                Require immediate attention
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-red-700" />
            </div>
          </div>

          {/* Hero Section: High-Priority Inspections */}
          <section id="legacy-high-priority" className="hidden mb-8 scroll-mt-20">
            <div className="bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden">
              {/* Section Header */}
              <div className="p-5 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
                      High-Priority Inspections
                    </h2>
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                      {highPriorityInspections.length} Products Requiring Action
                    </span>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Products requiring immediate investigation based on explainable risk scores and potential statutory violations.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1 font-semibold text-red-700">
                    <span className="w-2 h-2 rounded-full bg-red-600" /> Critical (76-100)
                  </span>
                  <span className="text-outline-variant">|</span>
                  <span className="flex items-center gap-1 font-semibold text-orange-700">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> High (51-75)
                  </span>
                </div>
              </div>

              {/* Cards / Rows List */}
              <div className="divide-y divide-outline-variant/60 bg-surface">
                {highPriorityInspections.length === 0 ? (
                  <div className="p-8 text-center bg-surface">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">
                      check_circle
                    </span>
                    <h4 className="text-sm font-bold text-on-surface">
                      No High-Priority Inspections
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      There are currently no high-risk items requiring immediate investigation.
                    </p>
                  </div>
                ) : (
                  highPriorityInspections.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 md:p-5 hover:bg-surface-container-lowest transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      {/* Left: Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-outline-variant shrink-0 bg-surface-container-high relative flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-outline">
                            inventory_2
                          </span>
                          <div className="absolute top-1 left-1">
                            <span className="text-[9px] font-mono font-bold bg-black/75 text-white px-1 py-0.5 rounded">
                              {(item.product_category ?? 'N/A').split(' ')[0]}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-base font-bold text-on-surface truncate">
                              {item.product_name}
                            </h3>
                            <RiskBadge
                              score={item.risk_score ?? 85}
                              level={
                                (item.risk_score || 0) >= 76
                                  ? 'CRITICAL'
                                  : 'HIGH'
                              }
                            />
                            <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded">
                              {new Date(item.created_at || Date.now()).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-on-surface-variant mb-1.5">
                            Manufacturer:{' '}
                            <span className="text-on-surface">{item.manufacturer_name ?? 'N/A'}</span>
                          </p>

                          <div className="flex items-start gap-1.5 text-xs text-red-700 bg-red-50/80 p-2 rounded border border-red-100 max-w-2xl mb-2">
                            <span className="material-symbols-outlined text-[16px] text-red-600 shrink-0 mt-0.5">
                              error
                            </span>
                            <div className="flex-1">
                              <strong className="font-semibold text-red-900">
                                Main Violation:
                              </strong>{' '}
                              Statutory non-compliance detected on product label.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex lg:flex-col sm:flex-row items-stretch lg:items-end justify-between lg:justify-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-outline-variant/40">
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                          <Button
                            variant="primary"
                            size="sm"
                            icon="visibility"
                            onClick={() => handleOpenScanEvidence(item)}
                            className="shadow-xs w-full lg:w-auto justify-center"
                          >
                            View Evidence
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Middle Section: Recent Inspections + Compliance Overview */}
          <div className="hidden grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left Column (8 cols): Recent Inspections Table */}
            <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 md:p-5 border-b border-outline-variant flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-surface">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-headline-md font-headline-md text-on-surface">
                      Recent Inspections
                    </h3>
                    {filterStatus !== 'ALL' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        Filter: {filterStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Audit records from field operations and automated visual checks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/history')}
                    className="text-primary hover:bg-surface-container-low text-xs"
                  >
                    View History →
                  </Button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="px-4 py-2 bg-surface-container-lowest border-b border-outline-variant/60 flex gap-2 overflow-x-auto">
                {(['ALL', 'FAIL', 'REVIEW', 'PASS'] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${filterStatus === status
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                  >
                    {status === 'ALL'
                      ? 'All Scans'
                      : status === 'FAIL'
                        ? 'Potential Non-Compliance'
                        : status === 'REVIEW'
                          ? 'Needs Review'
                          : 'Compliant'}
                  </button>
                ))}
              </div>

              {/* Table or Empty State */}
              <div className="overflow-x-auto flex-1">
                {filteredInspections.length === 0 ? (
                  <div className="p-10 text-center text-body-base text-on-surface-variant flex flex-col items-center justify-center min-h-[220px]">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2 font-light">
                      content_paste_search
                    </span>
                    <p className="font-semibold text-on-surface text-sm mb-1">
                      {filterStatus === 'ALL'
                        ? 'No inspections yet.'
                        : `No ${filterStatus.toLowerCase()} inspections found.`}
                    </p>
                    <p className="text-xs text-on-surface-variant mb-4">
                      {filterStatus === 'ALL'
                        ? 'Start your first product scan to see inspection results here.'
                        : 'Try changing your status filter or scan a new product.'}
                    </p>
                    {filterStatus === 'ALL' && (
                      <Button
                        variant="primary"
                        icon="add"
                        onClick={() => router.push('/scan/new')}
                      >
                        + Start First Scan
                      </Button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-bright border-b border-outline-variant text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Manufacturer</th>
                        <th className="py-3 px-4 w-28">Scan Date</th>
                        <th className="py-3 px-4 w-36">Status</th>
                        <th className="py-3 px-4 w-24 text-center">Risk</th>
                        <th className="py-3 px-4 w-28 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-base font-body-base text-on-surface divide-y divide-outline-variant/50">
                      {filteredInspections.map((scan) => {
                        const statusBadge =
                          scan.overall_result === 'pass'
                            ? 'PASS'
                            : scan.overall_result === 'review'
                              ? 'REVIEW'
                              : scan.overall_result === 'fail'
                                ? 'FAIL'
                                : 'DRAFT';

                        return (
                          <tr
                            key={scan.id}
                            className="hover:bg-surface-container-lowest transition-colors h-14"
                          >
                            <td className="py-2.5 px-4">
                              <div className="font-semibold text-xs text-on-surface">
                                {scan.product_name}
                              </div>
                              <span className="text-[10px] text-on-surface-variant font-mono">
                                {scan.inspection_number} • {scan.product_category ?? 'N/A'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-xs text-on-surface-variant">
                              {scan.manufacturer_name ?? 'N/A'}
                            </td>
                            <td className="py-2.5 px-4 font-data-tabular text-on-surface-variant text-xs">
                              {new Date(scan.created_at || Date.now()).toLocaleDateString(
                                'en-GB',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )}
                            </td>
                            <td className="py-2.5 px-4">
                              <StatusBadge status={statusBadge} />
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <RiskBadge
                                score={
                                  scan.risk_score ??
                                  (statusBadge === 'FAIL'
                                    ? 85
                                    : statusBadge === 'REVIEW'
                                      ? 50
                                      : 10)
                                }
                                level={
                                  (scan.risk_score ?? 0) >= 76
                                    ? 'CRITICAL'
                                    : (scan.risk_score ?? 0) >= 51
                                      ? 'HIGH'
                                      : 'LOW'
                                }
                                showScore={true}
                              />
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <button
                                onClick={() => handleOpenScanEvidence(scan)}
                                className="inline-block text-primary hover:text-primary-container font-label-bold text-xs hover:underline cursor-pointer"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right Column (4 cols): Compliance Overview Charts */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Chart 1: Status Distribution */}
              <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-label-bold font-label-bold text-on-surface uppercase tracking-wider text-xs">
                    Status Distribution
                  </h3>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {stats.total} Scans
                  </span>
                </div>

                <div className="flex items-center justify-center relative py-4">
                  {/* Donut Chart */}
                  <div
                    className="w-40 h-40 rounded-full bg-surface relative flex items-center justify-center shadow-inner transition-transform hover:scale-105 duration-300"
                    style={{
                      background:
                        stats.total > 0
                          ? `conic-gradient(#22c55e 0% ${passPercentage}%, #fbbf24 ${passPercentage}% ${passPercentage + reviewPercentage
                          }%, #ef4444 ${passPercentage + reviewPercentage}% 100%)`
                          : '#e2e8f0',
                    }}
                  >
                    <div className="w-24 h-24 bg-surface rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-xl font-bold font-sans text-on-surface">
                        {stats.total.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-semibold text-on-surface-variant">
                        Total
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distribution legend buttons */}
                <div className="mt-3 flex flex-col gap-1.5">
                  <button
                    onClick={() => setFilterStatus(filterStatus === 'PASS' ? 'ALL' : 'PASS')}
                    className={`flex justify-between items-center text-xs p-1.5 rounded transition-colors cursor-pointer ${filterStatus === 'PASS'
                        ? 'bg-green-50 font-bold'
                        : 'hover:bg-surface-container-low'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      Pass (Compliant)
                    </span>
                    <span className="font-mono font-bold">
                      {passPercentage}% ({stats.compliant})
                    </span>
                  </button>
                  <button
                    onClick={() => setFilterStatus(filterStatus === 'REVIEW' ? 'ALL' : 'REVIEW')}
                    className={`flex justify-between items-center text-xs p-1.5 rounded transition-colors cursor-pointer ${filterStatus === 'REVIEW'
                        ? 'bg-amber-50 font-bold'
                        : 'hover:bg-surface-container-low'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Needs Review
                    </span>
                    <span className="font-mono font-bold">
                      {reviewPercentage}% ({stats.needsReview})
                    </span>
                  </button>
                  <button
                    onClick={() => setFilterStatus(filterStatus === 'FAIL' ? 'ALL' : 'FAIL')}
                    className={`flex justify-between items-center text-xs p-1.5 rounded transition-colors cursor-pointer ${filterStatus === 'FAIL'
                        ? 'bg-red-50 font-bold'
                        : 'hover:bg-surface-container-low'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      Potential Non-Compliance
                    </span>
                    <span className="font-mono font-bold">
                      {failPercentage}% ({stats.nonCompliant})
                    </span>
                  </button>
                </div>
              </div>

              {/* Chart 2: Scanning Activity (30 Days) */}
              <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-xs flex flex-col justify-between flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-label-bold font-label-bold text-on-surface uppercase tracking-wider text-xs">
                    Inspection Activity (30 Days)
                  </h3>
                  <span className="text-[11px] text-green-700 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
                    {stats.total > 0
                      ? `Avg ${Math.ceil(stats.total / 30)}/day`
                      : '0/day'}
                  </span>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-2 h-36 relative overflow-hidden flex items-center justify-center">
                  {stats.total === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center">
                      No scan activity in the last 30 days
                    </p>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                      <svg
                        className="absolute inset-0 w-full h-full p-2"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 100"
                      >
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,75 Q15,65 30,55 T60,35 T80,45 T100,15 L100,100 L0,100 Z"
                          fill="url(#chartGrad)"
                        />
                        <path
                          d="M0,75 Q15,65 30,55 T60,35 T80,45 T100,15"
                          fill="none"
                          stroke="#1a73e8"
                          strokeWidth="2.5"
                          vectorEffect="non-scaling-stroke"
                        />
                        <circle cx="100" cy="15" r="3" fill="#1a73e8" />
                      </svg>
                      <div className="absolute bottom-1 right-2 text-[10px] font-mono text-outline">
                        Active Records Recorded
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Intelligence Row: Multi-Surface Consistency + Historical Change Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Card A: Multi-Surface Consistency */}
            <div className="bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden flex flex-col min-h-[220px]">
              <div className="p-4 md:p-5 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      flip_to_front
                    </span>
                    <h3 className="text-headline-md font-headline-md font-bold text-on-surface">
                      Cross-Surface Inconsistencies
                    </h3>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Contradictions detected between Front, Back, Side, and Top/Bottom package panels.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  0 Contradictions
                </span>
              </div>

              <div className="p-8 text-center bg-surface flex-1 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-outline mb-2">
                  flip_to_front
                </span>
                <p className="text-xs font-semibold text-on-surface">
                  No Cross-Surface Inconsistencies Detected
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Multi-panel contradictions will appear here after package scanning.
                </p>
              </div>
            </div>

            {/* Card B: Historical Change Intelligence */}
            <div className="bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden flex flex-col min-h-[220px]">
              <div className="p-4 md:p-5 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      update
                    </span>
                    <h3 className="text-headline-md font-headline-md font-bold text-on-surface">
                      Recent Compliance Changes
                    </h3>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Compliance Change Intelligence comparing previous vs current SKU inspections.
                  </p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  Delta Tracking Active
                </span>
              </div>

              <div className="p-8 text-center bg-surface flex-1 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-outline mb-2">
                  update
                </span>
                <p className="text-xs font-semibold text-on-surface">
                  No Historical Compliance Changes
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Delta tracking will log SKU updates across consecutive scans.
                </p>
              </div>
            </div>
          </div>

          {/* Top Violation Patterns Section */}
          <section className="mb-8">
            <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 pb-3 border-b border-outline-variant/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      insights
                    </span>
                    <h3 className="text-headline-md font-headline-md font-bold text-on-surface">
                      Top Violation Patterns
                    </h3>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Statutory Violation Pattern Intelligence under Legal Metrology Rules, 2011.
                  </p>
                </div>

                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container transition-colors"
                >
                  <span>View Violation Analytics</span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="p-8 text-center bg-surface-container-low rounded-xl border border-outline-variant/80">
                <span className="material-symbols-outlined text-3xl text-outline mb-2">
                  insights
                </span>
                <p className="text-xs font-semibold text-on-surface">
                  No Violation Patterns Detected Yet
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Statutory violation intelligence aggregates after scanning products.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions Ribbon */}
          <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-xs mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  bolt
                </span>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Quick Actions
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  icon="add"
                  onClick={() => router.push('/scan/new')}
                >
                  Start New Scan
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="priority_high"
                  onClick={() => {
                    const el = document.getElementById('high-priority');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View High-Priority
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="history"
                  onClick={() => router.push('/history')}
                >
                  Scan History
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="analytics"
                  onClick={() => router.push('/analytics')}
                >
                  Violation Analytics
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="description"
                  onClick={() => router.push('/reports')}
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
