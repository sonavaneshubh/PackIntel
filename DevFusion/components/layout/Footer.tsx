import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-4 px-6 flex flex-col sm:flex-row justify-between items-center text-body-sm font-body-sm mt-auto bg-surface border-t border-outline-variant text-secondary gap-3">
      <div className="font-label-bold text-xs">
        © 2024–2026 SIH034 Compliance Platform
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        <Link
          href="/rules"
          className="text-on-secondary-container hover:text-primary underline transition-colors"
        >
          Rule Database v2.4.1
        </Link>
        <Link
          href="/privacy"
          className="text-on-secondary-container hover:text-primary underline transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-on-secondary-container hover:text-primary underline transition-colors"
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
