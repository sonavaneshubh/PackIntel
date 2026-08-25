'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useCompliance } from '@/lib/complianceContext';

export function AnalyzingView() {
  const router = useRouter();
  const { pipelineStages, analysisLogs, runSimulatedAnalysis } = useCompliance();
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const cleanup = runSimulatedAnalysis(() => {
      setIsCompleted(true);
      // Auto-navigate to OCR Analysis after a brief moment
      setTimeout(() => {
        router.push('/scan/ocr');
      }, 1500);
    });

    return () => {
      cleanup();
    };
  }, []);

  return (
    <AppShell pageTitle="Analyzing Label">
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center justify-center py-6 min-h-[calc(100vh-160px)]">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-2 tracking-tight">
            Analyzing Product Label
          </h2>
          <p className="text-headline-md font-headline-md text-secondary font-normal tracking-wide">
            Read → Understand → Check → Explain
          </p>
        </div>

        {/* Pipeline Grid Card */}
        <div className="w-full bg-surface border border-outline-variant shadow-sm rounded-xl p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-1 bg-surface-container-highest z-0">
              <div
                className="h-full bg-primary transition-all duration-700 ease-in-out"
                style={{
                  width: `${
                    pipelineStages.filter((s) => s.status === 'complete').length *
                      33.33 +
                    (pipelineStages.find((s) => s.status === 'active')?.progress || 0) *
                      0.33
                  }%`,
                }}
              />
            </div>

            {/* Stages */}
            {pipelineStages.map((stage) => {
              const isActive = stage.status === 'active';
              const isDone = stage.status === 'complete';

              return (
                <div
                  key={stage.id}
                  className={`flex flex-col items-center relative z-10 text-center transition-all duration-300 ${
                    stage.status === 'pending' ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all ${
                      isDone
                        ? 'bg-green-600 text-white shadow-xs'
                        : isActive
                        ? 'bg-primary text-white pulsing-dot shadow-md'
                        : 'bg-surface-container-highest text-secondary border-2 border-surface-container-high'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[24px]"
                      style={{
                        fontVariationSettings: isDone || isActive ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      {isDone ? 'check' : stage.icon}
                    </span>
                  </div>

                  <h3 className="text-label-bold font-label-bold text-on-surface uppercase mb-2 tracking-wider">
                    {stage.name}
                  </h3>

                  <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mb-2 max-w-[160px]">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        isDone ? 'bg-green-600' : 'bg-primary'
                      }`}
                      style={{ width: `${isDone ? 100 : stage.progress}%` }}
                    />
                  </div>

                  <p className="text-body-sm font-data-tabular text-secondary text-xs">
                    {isDone ? '100%' : `${stage.progress}%`}
                  </p>

                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-2 text-xs leading-relaxed max-w-[160px]">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Logs Section */}
        <div className="w-full max-w-2xl bg-surface border border-outline-variant shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center border-b border-surface-container-highest pb-2 mb-4">
            <h4 className="text-label-bold font-label-bold text-secondary uppercase tracking-wider">
              Analysis Logs
            </h4>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Live Stream
            </span>
          </div>

          <ul className="space-y-3 font-data-tabular text-body-sm">
            {analysisLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-start gap-3 text-on-surface text-xs animate-in fade-in slide-in-from-left-2 duration-200"
              >
                {log.status === 'complete' ? (
                  <span
                    className="material-symbols-outlined text-green-600 text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                ) : log.status === 'running' ? (
                  <span className="material-symbols-outlined animate-spin-slow text-primary text-[18px]">
                    autorenew
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-outline text-[18px]">
                    radio_button_unchecked
                  </span>
                )}
                <span
                  className={
                    log.status === 'running'
                      ? 'text-primary font-semibold'
                      : log.status === 'complete'
                      ? 'text-on-surface font-medium'
                      : 'text-secondary opacity-60'
                  }
                >
                  {log.message}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t border-outline-variant/60 flex justify-between items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/scan/new')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon="arrow_forward"
              iconPosition="right"
              onClick={() => router.push('/scan/ocr')}
            >
              {isCompleted ? 'Proceed to OCR Extraction' : 'Skip to OCR Results'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
