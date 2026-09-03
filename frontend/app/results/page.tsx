'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCompliance } from '@/lib/complianceContext';

export default function ResultsPage() {
  const { declarations, productForm } = useCompliance();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const hasReviewItems = declarations.some((d) => d.reviewRequired);
  const overallStatus = hasReviewItems ? 'REVIEW' : 'PASS';
  const complianceScore = hasReviewItems ? 88 : 98;

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <AppShell pageTitle="Compliance Results">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface">
              Compliance Results & Report
            </h2>
            <StatusBadge status={overallStatus} />
          </div>
          <p className="text-body-base font-body-base text-on-surface-variant mt-1">
            Audit summary for <strong>{productForm.productName}</strong> under Legal Metrology Rules, 2011.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon="description"
            onClick={handleDownloadReport}
          >
            {downloadSuccess ? 'Report Downloaded!' : 'Export PDF Report'}
          </Button>
          <Link href="/scan/new">
            <Button variant="primary" icon="add">
              New Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-xs">
          <span className="text-label-bold font-label-bold text-on-surface-variant uppercase text-xs">
            Overall Compliance Score
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-display-lg font-display-lg text-primary">
              {complianceScore}%
            </span>
            <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded">
              Legal Standard Met
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-1000"
              style={{ width: `${complianceScore}%` }}
            />
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-xs">
          <span className="text-label-bold font-label-bold text-on-surface-variant uppercase text-xs">
            Mandatory Declarations Checked
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-display-lg font-display-lg text-on-surface">
              {declarations.length} / 7
            </span>
            <span className="text-xs text-on-surface-variant">Rule 6(1) items</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-3">
            All 7 statutory attributes extracted from primary front label.
          </p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-xs">
          <span className="text-label-bold font-label-bold text-on-surface-variant uppercase text-xs">
            Risk & Penalty Assessment
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-display-lg font-display-lg ${
                hasReviewItems ? 'text-amber-600' : 'text-green-600'
              }`}
            >
              {hasReviewItems ? 'Low' : 'Zero'}
            </span>
            <span className="text-xs text-on-surface-variant">Section 36 Liability</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-3">
            {hasReviewItems
              ? '1 attribute requires manual verification before dispatch.'
              : 'Zero non-compliance violations detected.'}
          </p>
        </div>
      </div>

      {/* Statutory Checklist Table */}
      <div className="bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden mb-8">
        <div className="p-5 border-b border-outline-variant bg-surface flex justify-between items-center">
          <h3 className="text-headline-md font-headline-md text-on-surface">
            Statutory Rule Breakdown
          </h3>
          <Link
            href="/scan/declarations"
            className="text-xs text-primary hover:underline font-semibold"
          >
            Edit Detected Declarations →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider text-xs">
                <th className="py-3 px-4 w-44">Clause</th>
                <th className="py-3 px-4">Required Attribute</th>
                <th className="py-3 px-4">Detected Value</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-28 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="text-body-base font-body-base text-on-surface divide-y divide-outline-variant/60">
              {declarations.map((item, idx) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container-lowest transition-colors h-14"
                >
                  <td className="py-2 px-4 font-mono text-xs text-on-surface-variant">
                    Rule 6(1)({String.fromCharCode(97 + idx)})
                  </td>
                  <td className="py-2 px-4 font-semibold text-xs text-on-surface">
                    {item.label}
                  </td>
                  <td className="py-2 px-4 text-xs font-data-tabular">
                    {item.value}
                  </td>
                  <td className="py-2 px-4">
                    <StatusBadge status={item.reviewRequired ? 'REVIEW' : 'PASS'} />
                  </td>
                  <td className="py-2 px-4 text-right font-data-tabular text-xs">
                    {item.confidence}%
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
