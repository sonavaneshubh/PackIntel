'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';

export default function ReportsPage() {
  const reports = [
    {
      id: 'REP-2026-08',
      title: 'Monthly Packaged Commodities Compliance Audit',
      date: '25 Aug 2026',
      size: '2.4 MB',
      type: 'PDF Executive Summary',
      scansIncluded: 1248,
      status: 'Generated',
    },
    {
      id: 'REP-2026-07',
      title: 'FMCG Food Labeling Regulatory Assessment',
      date: '31 Jul 2026',
      size: '4.1 MB',
      type: 'Detailed Statutory Filing',
      scansIncluded: 980,
      status: 'Archived',
    },
    {
      id: 'REP-2026-06',
      title: 'Packaging Metric Unit & USP Discrepancy Log',
      date: '30 Jun 2026',
      size: '1.8 MB',
      type: 'Discrepancy Log',
      scansIncluded: 740,
      status: 'Archived',
    },
  ];

  return (
    <AppShell pageTitle="Compliance Reports">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-2">
            Compliance Reports & Filings
          </h2>
          <p className="text-body-base font-body-base text-on-surface-variant">
            Automated statutory report generation for regulatory authorities and internal audits.
          </p>
        </div>
        <Button
          variant="primary"
          icon="add"
          onClick={() => alert('Generated new custom compliance audit report.')}
        >
          Generate Custom Report
        </Button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4">Report Title</th>
                <th className="py-3.5 px-4 w-36">Period / Date</th>
                <th className="py-3.5 px-4 w-32">Format</th>
                <th className="py-3.5 px-4 w-32 text-right">Scans</th>
                <th className="py-3.5 px-4 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-body-base font-body-base text-on-surface divide-y divide-outline-variant/60">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-surface-container-lowest transition-colors h-14">
                  <td className="py-2 px-4">
                    <p className="font-semibold text-xs text-on-surface">{rep.title}</p>
                    <p className="text-[11px] text-on-surface-variant font-mono">{rep.id} • {rep.size}</p>
                  </td>
                  <td className="py-2 px-4 text-xs font-data-tabular text-on-surface-variant">{rep.date}</td>
                  <td className="py-2 px-4 text-xs text-on-surface-variant">{rep.type}</td>
                  <td className="py-2 px-4 font-data-tabular text-right text-xs font-medium">{rep.scansIncluded}</td>
                  <td className="py-2 px-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      icon="download"
                      onClick={() => alert(`Downloading ${rep.title}`)}
                    >
                      Download
                    </Button>
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
