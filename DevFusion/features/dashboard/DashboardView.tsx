'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCompliance } from '@/lib/complianceContext';

export function DashboardView() {
  const router = useRouter();
  const { kpiStats, scans } = useCompliance();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredScans = scans.filter((scan) => {
    if (filterStatus === 'ALL') return true;
    return scan.status === filterStatus;
  });

  return (
    <AppShell pageTitle="Dashboard">
      {/* Page Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-2">
            Packaged Commodity Compliance
          </h1>
          <p className="text-body-base font-body-base text-on-surface-variant">
            AI-assisted label screening and evidence-based compliance checking
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push('/history')}
            className="shadow-xs"
          >
            View Scan History
          </Button>
          <Button
            variant="primary"
            icon="add"
            onClick={() => router.push('/scan/new')}
            className="shadow-xs"
          >
            Start New Scan
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Scans */}
        <div className="bg-surface border border-outline-variant rounded p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider">
              Total Scans
            </h3>
            <span className="material-symbols-outlined text-outline">
              analytics
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display-lg font-display-lg text-on-surface">
              {kpiStats.totalScans.toLocaleString()}
            </span>
            <span className="text-body-sm font-label-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              {kpiStats.totalScansGrowth}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
        </div>

        {/* PASS */}
        <div className="bg-surface border border-outline-variant rounded p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider">
              PASS
            </h3>
            <span className="material-symbols-outlined text-green-600">
              check_circle
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display-lg font-display-lg text-on-surface">
              {kpiStats.passCount}
            </span>
            <span className="text-body-sm font-label-bold text-on-surface-variant">
              {kpiStats.passPercentage}%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500" />
        </div>

        {/* NEEDS REVIEW */}
        <div className="bg-surface border border-outline-variant rounded p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider">
              NEEDS REVIEW
            </h3>
            <span className="material-symbols-outlined text-amber-500">
              warning
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display-lg font-display-lg text-on-surface">
              {kpiStats.reviewCount}
            </span>
            <span className="text-body-sm font-label-bold text-on-surface-variant">
              {kpiStats.reviewPercentage}%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400" />
        </div>

        {/* NON-COMPLIANCE */}
        <div className="bg-surface border border-outline-variant rounded p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider">
              POTENTIAL NON-COMPLIANCE
            </h3>
            <span className="material-symbols-outlined text-red-600">
              error
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-display-lg font-display-lg text-on-surface">
              {kpiStats.failCount}
            </span>
            <span className="text-body-sm font-label-bold text-on-surface-variant">
              {kpiStats.failPercentage}%
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500" />
        </div>
      </div>

      {/* Compliance Overview / Charts Section */}
      <h2 className="text-headline-md font-headline-md text-on-surface mb-4">
        Compliance Overview
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart 1: Status Distribution */}
        <div className="bg-surface border border-outline-variant rounded p-5 shadow-xs flex flex-col">
          <h3 className="text-label-bold font-label-bold text-on-surface uppercase mb-4">
            Status Distribution
          </h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            {/* Donut Chart with Conic Gradient */}
            <div
              className="w-44 h-44 rounded-full bg-surface relative flex items-center justify-center shadow-inner transition-transform hover:scale-105 duration-300"
              style={{
                background:
                  'conic-gradient(#22c55e 0% 67.5%, #fbbf24 67.5% 90.4%, #ef4444 90.4% 100%)',
              }}
            >
              <div className="w-28 h-28 bg-surface rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="text-headline-md font-headline-md text-on-surface">
                  {kpiStats.totalScans.toLocaleString()}
                </span>
                <span className="text-label-bold font-label-bold text-on-surface-variant text-xs">
                  Total
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => setFilterStatus(filterStatus === 'PASS' ? 'ALL' : 'PASS')}
              className={`flex justify-between items-center text-body-sm font-body-sm p-1.5 rounded transition-colors ${
                filterStatus === 'PASS' ? 'bg-green-50 font-semibold' : 'hover:bg-surface-container-low'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                Pass
              </span>
              <span className="font-data-tabular">67.5%</span>
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === 'REVIEW' ? 'ALL' : 'REVIEW')}
              className={`flex justify-between items-center text-body-sm font-body-sm p-1.5 rounded transition-colors ${
                filterStatus === 'REVIEW' ? 'bg-amber-50 font-semibold' : 'hover:bg-surface-container-low'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Review
              </span>
              <span className="font-data-tabular">22.9%</span>
            </button>
            <button
              onClick={() => setFilterStatus(filterStatus === 'FAIL' ? 'ALL' : 'FAIL')}
              className={`flex justify-between items-center text-body-sm font-body-sm p-1.5 rounded transition-colors ${
                filterStatus === 'FAIL' ? 'bg-red-50 font-semibold' : 'hover:bg-surface-container-low'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Fail
              </span>
              <span className="font-data-tabular">9.6%</span>
            </button>
          </div>
        </div>

        {/* Chart 2: Scanning Activity (30 Days) */}
        <div className="bg-surface border border-outline-variant rounded p-5 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-label-bold font-label-bold text-on-surface uppercase">
              Scanning Activity (30 Days)
            </h3>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" /> Daily Volume
              </span>
            </div>
          </div>
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded flex items-end p-4 gap-2 h-52 relative overflow-hidden">
            {/* SVG smooth area & line chart */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
            <svg
              className="absolute inset-0 w-full h-full p-2"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1a73e8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,80 Q10,60 20,70 T40,40 T60,50 T80,20 T100,10 L100,100 L0,100 Z"
                fill="url(#areaGradient)"
              />
              <path
                d="M0,80 Q10,60 20,70 T40,40 T60,50 T80,20 T100,10"
                fill="none"
                stroke="#1a73e8"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
              {/* Points */}
              <circle cx="0" cy="80" r="3" fill="#1a73e8" />
              <circle cx="20" cy="70" r="3" fill="#1a73e8" />
              <circle cx="40" cy="40" r="3" fill="#1a73e8" />
              <circle cx="60" cy="50" r="3" fill="#1a73e8" />
              <circle cx="80" cy="20" r="3" fill="#1a73e8" />
              <circle cx="100" cy="10" r="3" fill="#1a73e8" />
            </svg>
            {/* Reference axes */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-outline-variant" />
            <div className="absolute left-0 top-0 h-full w-px bg-outline-variant" />
            <div className="absolute bottom-2 right-4 text-[10px] text-outline font-data-tabular">
              Peak: 84 scans/day (Aug 24)
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-surface border border-outline-variant rounded shadow-xs overflow-hidden flex flex-col">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
            <h3 className="text-headline-md font-headline-md text-on-surface">
              Recent Scans
            </h3>
            {filterStatus !== 'ALL' && (
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                Filtered: {filterStatus}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/history')}
            className="text-primary hover:bg-surface-container-low"
          >
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4 w-32">Scan ID</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 w-32">Date</th>
                <th className="py-3 px-4 w-40">Status</th>
                <th className="py-3 px-4 w-24 text-right">Confidence</th>
                <th className="py-3 px-4 w-24 text-right">Issues</th>
                <th className="py-3 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-body-base font-body-base text-on-surface divide-y divide-outline-variant/50">
              {filteredScans.map((scan) => (
                <tr
                  key={scan.id}
                  className="hover:bg-surface-container-lowest transition-colors h-12"
                >
                  <td className="py-2 px-4 font-data-tabular text-on-surface-variant font-medium">
                    {scan.id}
                  </td>
                  <td className="py-2 px-4 font-medium">{scan.productName}</td>
                  <td className="py-2 px-4 font-data-tabular text-on-surface-variant text-xs">
                    {scan.date}
                  </td>
                  <td className="py-2 px-4">
                    <StatusBadge status={scan.status} />
                  </td>
                  <td className="py-2 px-4 font-data-tabular text-right">
                    {scan.confidence}%
                  </td>
                  <td
                    className={`py-2 px-4 font-data-tabular text-right ${
                      scan.issueCount > 0
                        ? scan.status === 'FAIL'
                          ? 'text-red-600 font-bold'
                          : 'text-amber-600 font-bold'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {scan.issueCount}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {scan.status === 'PASS' ? (
                      <Link
                        href="/scan/ocr"
                        className="text-primary hover:underline text-label-bold font-label-bold"
                      >
                        View
                      </Link>
                    ) : (
                      <Link
                        href="/scan/declarations"
                        className="inline-block text-on-surface-variant hover:text-primary border border-outline-variant hover:border-primary px-3 py-1 rounded text-label-bold font-label-bold transition-colors"
                      >
                        Review
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
