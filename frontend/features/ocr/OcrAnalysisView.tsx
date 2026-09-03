'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ConfidenceBadge } from '@/components/ui/Badge';
import { useCompliance } from '@/lib/complianceContext';

export function OcrAnalysisView() {
  const router = useRouter();
  const {
    uploadedImageUrl,
    boundingBoxes,
    extractedEntities,
    activeBoundingBoxId,
    setActiveBoundingBoxId,
  } = useCompliance();

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const handleEntityHover = (name: string) => {
    if (name.toLowerCase().includes('mrp')) setActiveBoundingBoxId('mrp');
    else if (name.toLowerCase().includes('qty') || name.toLowerCase().includes('quantity'))
      setActiveBoundingBoxId('net_qty');
    else if (name.toLowerCase().includes('mfg') || name.toLowerCase().includes('manufacturer'))
      setActiveBoundingBoxId('mfg');
    else setActiveBoundingBoxId(null);
  };

  return (
    <AppShell pageTitle="OCR Extraction & Identification">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg-mobile md:font-display-lg text-on-surface mb-2">
          OCR Extraction & Identification
        </h2>
        <p className="text-body-base font-body-base text-on-surface-variant">
          Review raw text extraction and entity mapping from the product label.
        </p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Product Label Image with Bounding Boxes */}
        <div className="bg-surface border border-outline-variant rounded-lg p-4 md:p-5 shadow-xs flex flex-col h-full">
          <div className="flex justify-between items-center border-b border-outline-variant pb-3 mb-4">
            <h3 className="text-headline-md font-headline-md text-on-surface">
              Label Scan
            </h3>
            <span className="text-xs text-on-surface-variant bg-surface-container-highest px-2.5 py-1 rounded-full font-mono">
              3 Regions Mapped
            </span>
          </div>

          <div className="relative flex-1 bg-surface-container-low rounded border border-outline-variant overflow-hidden min-h-[420px] flex items-center justify-center">
            {/* Label Image */}
            <img
              src={
                uploadedImageUrl ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAAU3ranM15SAG_xqt-7ZZy8BMMvqB08Ft6RhHvCydF4Q7DVp9998gS_UfwsULXZsR61oZ-60LerbtvBe64CKZT9BDf-8eZbZJYhqGmiR4U37JvsEJm_L29j6eV2-KTLC4Zq_nKbd9Y5-rHIOHgePjWM9-UgXShaexL6P9VL_HU6RdRc2GC4bN9A-rLLDUE6JOSnwyNzS0CUigzx9Z-jOwhKDHbDTxrmXN5J3S4zrqaAXQphiJN3qs_'
              }
              alt="High-resolution packaged commodity label scan"
              className="w-full h-full object-cover absolute inset-0"
            />

            {/* Overlay Bounding Boxes */}
            <div className="absolute inset-0 p-4">
              {/* Box 1: MRP */}
              <div
                onMouseEnter={() => setActiveBoundingBoxId('mrp')}
                onMouseLeave={() => setActiveBoundingBoxId(null)}
                className={`absolute top-[15%] left-[60%] w-28 h-9 border-2 rounded flex items-start justify-start cursor-pointer transition-all group ${
                  activeBoundingBoxId === 'mrp'
                    ? 'border-primary bg-primary/40 scale-105 shadow-md'
                    : 'border-primary bg-primary/20 hover:bg-primary/30'
                }`}
              >
                <div className="bg-primary text-on-primary text-[10px] font-label-bold px-1.5 py-0.5 absolute -top-5 left-0 rounded-t shadow-xs whitespace-nowrap opacity-100 group-hover:-top-6 transition-all">
                  MRP - 98%
                </div>
              </div>

              {/* Box 2: Net Qty */}
              <div
                onMouseEnter={() => setActiveBoundingBoxId('net_qty')}
                onMouseLeave={() => setActiveBoundingBoxId(null)}
                className={`absolute top-[35%] left-[20%] w-36 h-11 border-2 rounded flex items-start justify-start cursor-pointer transition-all group ${
                  activeBoundingBoxId === 'net_qty'
                    ? 'border-teal-500 bg-teal-500/40 scale-105 shadow-md'
                    : 'border-teal-500 bg-teal-500/20 hover:bg-teal-500/30'
                }`}
              >
                <div className="bg-teal-500 text-white text-[10px] font-label-bold px-1.5 py-0.5 absolute -top-5 left-0 rounded-t shadow-xs whitespace-nowrap opacity-100 group-hover:-top-6 transition-all">
                  Net Qty - 96%
                </div>
              </div>

              {/* Box 3: Manufacturer */}
              <div
                onMouseEnter={() => setActiveBoundingBoxId('mfg')}
                onMouseLeave={() => setActiveBoundingBoxId(null)}
                className={`absolute top-[60%] left-[10%] w-52 h-18 border-2 rounded flex items-start justify-start cursor-pointer transition-all group ${
                  activeBoundingBoxId === 'mfg'
                    ? 'border-indigo-500 bg-indigo-500/40 scale-105 shadow-md'
                    : 'border-indigo-500 bg-indigo-500/20 hover:bg-indigo-500/30'
                }`}
              >
                <div className="bg-indigo-500 text-white text-[10px] font-label-bold px-1.5 py-0.5 absolute -top-5 left-0 rounded-t shadow-xs whitespace-nowrap opacity-100 group-hover:-top-6 transition-all">
                  Manufacturer - 94%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Data Table */}
        <div className="bg-surface border border-outline-variant rounded-lg shadow-xs flex flex-col h-full overflow-hidden">
          <div className="p-4 md:p-5 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
            <h3 className="text-headline-md font-headline-md text-on-surface">
              Extracted Entities
            </h3>
            <span className="text-xs text-on-surface-variant">
              Hover entity to inspect bounding box
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant">
                  <th className="p-3.5 text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider text-xs">
                    Entity
                  </th>
                  <th className="p-3.5 text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider text-xs">
                    Extracted Value
                  </th>
                  <th className="p-3.5 text-label-bold font-label-bold text-on-surface-variant uppercase tracking-wider text-right text-xs">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="text-data-tabular font-data-tabular text-on-surface divide-y divide-outline-variant/60 bg-surface">
                {extractedEntities.map((item) => (
                  <tr
                    key={item.id}
                    onMouseEnter={() => handleEntityHover(item.name)}
                    onMouseLeave={() => setActiveBoundingBoxId(null)}
                    onClick={() => setSelectedEntityId(item.id)}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${item.colorDot} group-hover:scale-125 transition-transform`}
                        />
                        <span className="font-semibold text-xs text-on-surface">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-xs text-on-surface">
                      {item.extractedValue}
                    </td>
                    <td className="p-3.5 text-right">
                      <ConfidenceBadge confidence={item.confidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
        <Button
          variant="outline"
          icon="arrow_back"
          onClick={() => router.push('/scan/new')}
        >
          Back to Image
        </Button>
        <Button
          variant="primary"
          icon="arrow_forward"
          iconPosition="right"
          onClick={() => router.push('/scan/declarations')}
          className="px-6"
        >
          Review Declarations
        </Button>
      </div>
    </AppShell>
  );
}
