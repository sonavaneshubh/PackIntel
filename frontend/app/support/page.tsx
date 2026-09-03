'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';

export default function SupportPage() {
  return (
    <AppShell pageTitle="Support & Helpdesk">
      <div className="mb-6">
        <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-2">
          Compliance Helpdesk & Technical Support
        </h2>
        <p className="text-body-base font-body-base text-on-surface-variant">
          Get assistance regarding Legal Metrology compliance interpretations or software operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-xs">
          <span className="material-symbols-outlined text-primary text-3xl mb-2">
            menu_book
          </span>
          <h3 className="text-base font-bold text-on-surface mb-2">
            User Documentation & FAQs
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
            Learn best practices for capturing product labels, resolving OCR discrepancies, and exporting legal reports.
          </p>
          <Button variant="outline" size="sm" onClick={() => alert('Opening compliance guide documentation...')}>
            Read Documentation
          </Button>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-xs">
          <span className="material-symbols-outlined text-primary text-3xl mb-2">
            support_agent
          </span>
          <h3 className="text-base font-bold text-on-surface mb-2">
            Contact Technical Team
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
            Reach out to our technical engineering team for system integration, custom API webhooks, or batch processing support.
          </p>
          <Button variant="primary" size="sm" onClick={() => alert('Support ticket initiated.')}>
            Submit Ticket
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
