import React from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Inspector Sign In | PackIntel',
  description: 'Authorized inspector authentication for PackIntel Legal Metrology compliance platform.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-between items-center p-4 sm:p-6 antialiased">
      {/* Top Bar Header Banner */}
      <header className="w-full max-w-5xl py-2 flex items-center justify-between border-b border-outline-variant/60 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Legal Metrology Compliance Enforcement Portal</span>
        </div>
        <div className="hidden sm:block text-[11px] font-mono text-outline">
          Rule Engine v2.4.1 Active
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="w-full flex items-center justify-center my-auto py-8">
        <LoginForm />
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-on-surface-variant border-t border-outline-variant/60 gap-2">
        <div>
          © 2024–2026 PackIntel • Department of Consumer Affairs, Government of India
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-on-surface transition-colors">Security & Privacy</span>
          <span>•</span>
          <span className="hover:text-on-surface transition-colors">Legal Metrology Act, 2009</span>
        </div>
      </footer>
    </div>
  );
}
