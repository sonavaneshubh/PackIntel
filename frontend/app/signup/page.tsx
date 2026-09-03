'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, user, isLoading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (user && !authLoading) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your inspector email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email format (e.g. inspector@gov.in).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp({
        email: trimmedEmail,
        password,
        fullName: fullName.trim() || 'Legal Metrology Inspector',
      });

      if (result.success) {
        setSuccessMessage('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setErrorMessage(result.error || 'Failed to create inspector account.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during account registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col justify-between items-center p-4 sm:p-6 antialiased">
      {/* Header */}
      <header className="w-full max-w-5xl py-2 flex items-center justify-between border-b border-outline-variant/60 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Legal Metrology Inspector Registration</span>
        </div>
        <div className="hidden sm:block text-[11px] font-mono text-outline">
          Rule Engine v2.4.1 Active
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex items-center justify-center my-auto py-8">
        <div className="w-full max-w-md bg-surface border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Emblem Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl shadow-md mb-3 border border-primary/20">
              <span className="material-symbols-outlined text-[32px]">person_add</span>
            </div>
            <h1 className="text-2xl font-bold font-sans text-on-surface tracking-tight">
              Create Inspector Account
            </h1>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-0.5">
              PackIntel Legal Metrology Platform
            </p>
          </div>

          {/* Success Callout */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Error Callout */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="inspector_name"
                className="block text-xs font-label-bold font-semibold uppercase tracking-wider text-on-surface mb-1.5"
              >
                Full Name / Officer Designation
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
                  person
                </span>
                <input
                  id="inspector_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Officer R. K. Sharma"
                  disabled={isSubmitting}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="inspector_email"
                className="block text-xs font-label-bold font-semibold uppercase tracking-wider text-on-surface mb-1.5"
              >
                Inspector Email *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
                  badge
                </span>
                <input
                  id="inspector_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. inspector@gov.in"
                  disabled={isSubmitting}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="inspector_password"
                className="block text-xs font-label-bold font-semibold uppercase tracking-wider text-on-surface mb-1.5"
              >
                Password * (min. 6 characters)
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
                  lock
                </span>
                <input
                  id="inspector_password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  disabled={isSubmitting}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-10 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 text-outline hover:text-on-surface transition-colors cursor-pointer rounded"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-xs font-label-bold font-semibold uppercase tracking-wider text-on-surface mb-1.5"
              >
                Confirm Password *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
                  lock_clock
                </span>
                <input
                  id="confirm_password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  disabled={isSubmitting}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full py-2.5 shadow-sm justify-center text-xs font-bold tracking-wide"
              >
                {isSubmitting ? 'Creating Inspector Account...' : 'Register Inspector Account'}
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-3 border-t border-outline-variant/60">
              <p className="text-xs text-on-surface-variant">
                Already have an authorized account?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-on-surface-variant border-t border-outline-variant/60 gap-2">
        <div>© 2024–2026 PackIntel • Department of Consumer Affairs, Government of India</div>
        <div>Authorized Registration System</div>
      </footer>
    </div>
  );
}
