'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge, RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCompliance } from '@/lib/complianceContext';

export default function HistoryPage() {
  const { scans } = useCompliance();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = scans.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.manufacturer && s.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell pageTitle="Scan History">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-2">
            Scan History
          </h2>
          <p className="text-body-base font-body-base text-on-surface-variant">
            Archive of all automated and manual compliance audits conducted.
          </p>
        </div>
        <Link href="/scan/new">
          <Button variant="primary" icon="add">
            New Scan
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-outline-variant rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 w-full md:w-80">
          <span className="material-symbols-outlined text-outline mr-2 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by ID, product, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-on-surface placeholder:text-outline"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'PASS', 'REVIEW', 'FAIL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-label-bold font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4 w-32">Scan ID</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 w-32">Date</th>
                <th className="py-3.5 px-4 w-36">Status</th>
                <th className="py-3.5 px-4 w-28 text-center">Risk Score</th>
                <th className="py-3.5 px-4 w-24 text-right">Confidence</th>
                <th className="py-3.5 px-4 w-24 text-right">Issues</th>
                <th className="py-3.5 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-body-base font-body-base text-on-surface divide-y divide-outline-variant/60">
              {filtered.map((scan) => (
                <tr
                  key={scan.id}
                  className="hover:bg-surface-container-lowest transition-colors h-14"
                >
                  <td className="py-2 px-4 font-data-tabular text-on-surface-variant font-medium text-xs">
                    {scan.id}
                  </td>
                  <td className="py-2 px-4">
                    <p className="font-semibold text-xs text-on-surface">
                      {scan.productName}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {scan.manufacturer || 'Packer specified'}
                    </p>
                  </td>
                  <td className="py-2 px-4 text-xs text-on-surface-variant">
                    {scan.category}
                  </td>
                  <td className="py-2 px-4 font-data-tabular text-on-surface-variant text-xs">
                    {scan.date}
                  </td>
                  <td className="py-2 px-4">
                    <StatusBadge status={scan.status} />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <RiskBadge
                      score={scan.riskScore || (scan.status === 'FAIL' ? 82 : scan.status === 'REVIEW' ? 61 : 18)}
                      level={scan.riskLevel || (scan.status === 'FAIL' ? 'HIGH' : scan.status === 'REVIEW' ? 'HIGH' : 'LOW')}
                    />
                  </td>
                  <td className="py-2 px-4 font-data-tabular text-right text-xs">
                    {scan.confidence}%
                  </td>
                  <td
                    className={`py-2 px-4 font-data-tabular text-right text-xs ${
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
                    <Link
                      href="/scan/ocr"
                      className="text-primary hover:underline text-label-bold font-label-bold text-xs"
                    >
                      View Scan
                    </Link>
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
