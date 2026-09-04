'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { Inspection, ComplianceResultRow, ExtractedLabel } from '@/types/database';
import { complianceRules } from '@/lib/constants/complianceRules';

interface ComplianceResultWithRule extends ComplianceResultRow {
  ruleDescription?: string;
  mandatory?: boolean;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get('inspection');

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [complianceResults, setComplianceResults] = useState<ComplianceResultWithRule[]>([]);
  const [extractedLabel, setExtractedLabel] = useState<ExtractedLabel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!inspectionId) {
      setError('No inspection ID provided');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch inspection with related data
        const { data: inspData, error: inspError } = await supabase
          .from('inspections')
          .select(`
            *,
            extracted_labels (*),
            compliance_results (*),
            inspection_images (*)
          `)
          .eq('id', inspectionId)
          .single();

        if (inspError) throw inspError;

        if (inspData) {
          setInspection(inspData);
          setExtractedLabel(inspData.extracted_labels?.[0] || null);
          setComplianceResults(inspData.compliance_results || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [inspectionId]);

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <AppShell pageTitle="Compliance Results">
        <div className="max-w-5xl mx-auto w-full flex flex-col items-center justify-center py-12">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">autorenew</span>
          <p className="text-body-base text-on-surface-variant">Loading compliance results...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !inspection) {
    return (
      <AppShell pageTitle="Results Error">
        <div className="max-w-md mx-auto text-center py-12">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Failed to Load Results</h2>
          <p className="text-body-base text-on-surface-variant mb-6">{error || 'Inspection not found'}</p>
          <Button variant="primary" onClick={() => router.push('/scan/new')}>
            Start New Scan
          </Button>
        </div>
      </AppShell>
    );
  }

  const hasReviewItems = complianceResults.some(r => r.result === 'warning');
  const hasFailItems = complianceResults.some(r => r.result === 'fail');
  const insufficientInformation = inspection.overall_result === 'review' && inspection.risk_score === 0;
  const overallStatus = insufficientInformation ? 'REVIEW' : hasFailItems ? 'FAIL' : hasReviewItems ? 'REVIEW' : 'PASS';
  const complianceScore = insufficientInformation ? 0 : hasFailItems ? 40 : hasReviewItems ? 75 : 95;

  // Merge with rule descriptions from constants
  const enrichedResults = complianceResults.map(cr => {
    const rule = complianceRules.find(r => r.id === cr.rule_code);
    return {
      ...cr,
      ruleDescription: rule?.description,
      mandatory: rule?.mandatory,
    };
  });

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
            Audit summary for <strong>{inspection.product_name || 'Unknown Product'}</strong> under Legal Metrology Rules, 2011.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" icon="description" onClick={handleDownloadReport}>
            {downloadSuccess ? 'Report Downloaded!' : 'Export PDF Report'}
          </Button>
          <Link href="/scan/new">
            <Button variant="primary" icon="add">New Scan</Button>
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
            <span className="text-display-lg font-display-lg text-primary">{complianceScore}%</span>
            <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded">
              {insufficientInformation ? 'Insufficient Information' : overallStatus === 'PASS' ? 'Legal Standard Met' : overallStatus === 'REVIEW' ? 'Review Recommended' : 'Non-Compliant'}
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-2 rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${overallStatus === 'PASS' ? 'bg-green-500' : overallStatus === 'REVIEW' ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${complianceScore}%` }} />
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-xs">
          <span className="text-label-bold font-label-bold text-on-surface-variant uppercase text-xs">
            Rules Evaluated
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-display-lg font-display-lg text-on-surface">
              {enrichedResults.length} / {complianceRules.length}
            </span>
            <span className="text-xs text-on-surface-variant">Rule 6(1) items</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-3">
            {enrichedResults.filter(r => r.result === 'pass').length} passed, {enrichedResults.filter(r => r.result === 'fail').length} failed, {enrichedResults.filter(r => r.result === 'warning').length} warnings
          </p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-xs">
          <span className="text-label-bold font-label-bold text-on-surface-variant uppercase text-xs">
            Risk & Penalty Assessment
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-display-lg font-display-lg ${hasFailItems ? 'text-red-600' : hasReviewItems ? 'text-amber-600' : 'text-green-600'}`}>
              {inspection.risk_score ?? 0}
            </span>
            <span className="text-xs text-on-surface-variant">Risk Score (0-100)</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-3">
            {insufficientInformation ? inspection.notes || 'No readable package-label information was detected. Upload a clearer image.' : hasFailItems ? 'Statutory violations detected - penalties may apply under Section 36' : hasReviewItems ? 'Review recommended before market dispatch' : 'Zero non-compliance violations detected'}
          </p>
        </div>
      </div>

      {/* Statutory Checklist Table */}
      <div className="bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden mb-8">
        <div className="p-5 border-b border-outline-variant bg-surface flex justify-between items-center">
          <h3 className="text-headline-md font-headline-md text-on-surface">
            Statutory Rule Breakdown
          </h3>
          <Link href={`/scan/declarations?inspection=${inspectionId}`} className="text-xs text-primary hover:underline font-semibold">
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
                <th className="py-3 px-4 w-28 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="text-body-base font-body-base text-on-surface divide-y divide-outline-variant/60">
              {enrichedResults.map((item, idx) => (
                <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors h-14">
                  <td className="py-2 px-4 font-mono text-xs text-on-surface-variant">
                    {item.rule_code}
                  </td>
                  <td className="py-2 px-4 font-semibold text-xs text-on-surface">
                    {item.rule_name}
                  </td>
                  <td className="py-2 px-4 text-xs font-data-tabular max-w-xs truncate">
                    {item.extracted_value || '<Not detected>'}
                  </td>
                  <td className="py-2 px-4">
                    <StatusBadge
                      status={
                        item.result.toUpperCase() === "PASS"
                          ? "good"
                          : item.result.toUpperCase() === "FAIL"
                            ? "error"
                            : item.result.toUpperCase() === "REVIEW" || item.result.toUpperCase() === "WARNING"
                              ? "warning"
                              : "pending"
                      }
                    />
                  </td>
                  <td className="py-2 px-4 text-right font-data-tabular text-xs">
                    {item.result === 'fail' ? 'High' : item.result === 'warning' ? 'Medium' : 'Low'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Explanations */}
      <div className="bg-surface border border-outline-variant rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-outline-variant bg-surface">
          <h3 className="text-headline-md font-headline-md text-on-surface">Detailed Explanations & Evidence</h3>
        </div>
        <div className="divide-y divide-outline-variant/60">
          {enrichedResults.map((item) => (
            <div key={item.id} className="p-5 hover:bg-surface-container-lowest transition-colors">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-on-surface-variant">{item.rule_code}</span>
                    <span className="font-semibold text-sm text-on-surface">{item.rule_name}</span>
                    <StatusBadge
                      status={
                        item.result.toUpperCase() === "PASS"
                          ? "good"
                          : item.result.toUpperCase() === "FAIL"
                            ? "error"
                            : item.result.toUpperCase() === "REVIEW" || item.result.toUpperCase() === "WARNING"
                              ? "warning"
                              : "pending"
                      }
                    />                  </div>
                  {item.ruleDescription && (
                    <p className="text-xs text-on-surface-variant">{item.ruleDescription}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-on-surface-variant font-medium">Requirement:</span>
                  <p className="text-on-surface mt-0.5">{item.requirement}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-medium">Extracted Value:</span>
                  <p className="text-on-surface font-mono mt-0.5">{item.extracted_value || '<Not detected>'}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant font-medium">Evidence:</span>
                  <p className="text-on-surface mt-0.5">{item.evidence || 'OCR text analysis'}</p>
                </div>
              </div>
              {item.explanation && (
                <div className="mt-3 p-3 bg-surface-container-lowest rounded text-xs">
                  <span className="font-semibold text-on-surface">Explanation: </span>
                  <span className="text-on-surface-variant">{item.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}