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
    <div className="min-h-screen bg-background flex flex-col justify-between items-center p-4 antialiased">
      {/* Header */}
      <header className="w-full max-w-5xl border-b border-outline-variant/60 py-3 text-body-sm font-body-sm text-on-surface-variant">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Legal Metrology Inspector Registration</span>
        </div>
        <div className="hidden sm:block text-body-sm font-mono text-outline">
          Rule Engine v2.4.1 Active
        </div>
      </header>

      {/* Main Container */}
      <main className="my-auto flex w-full items-center justify-center py-8 sm:py-10">
        <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_12px_32px_rgba(25,28,29,0.08)] sm:p-8">
          {/* Emblem Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary text-2xl font-bold text-on-primary shadow-md">
              <span className="material-symbols-outlined text-[32px]">person_add</span>
            </div>
            <h1 className="text-display-lg-mobile font-display-lg text-on-surface md:text-display-lg">
              Create Inspector Account
            </h1>
            <p className="text-label-bold font-label-bold text-primary uppercase tracking-wider mt-0.5">
              Legal Metrology Compliance Inspection Platform
            </p>
            <p className="mt-1.5 text-body-sm font-body-sm text-on-surface-variant">
              Register for secure inspection and compliance workflows.
            </p>
          </div>

          {/* Success Callout */}
          {successMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-body-sm font-body-sm text-[#15803D]">
              <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Error Callout */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-body-sm font-body-sm text-[#B91C1C]">
              <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="inspector_name"
                className="block text-label-bold font-label-bold uppercase tracking-wider text-on-surface mb-1.5"
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
                  className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-3.5 text-body-base font-body-base text-on-surface placeholder:text-outline transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="inspector_email"
                className="block text-label-bold font-label-bold uppercase tracking-wider text-on-surface mb-1.5"
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
                  className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-3.5 text-body-base font-body-base text-on-surface placeholder:text-outline transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="inspector_password"
                className="block text-label-bold font-label-bold uppercase tracking-wider text-on-surface mb-1.5"
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
                  className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-10 text-body-base font-body-base text-on-surface placeholder:text-outline transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
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
                className="block text-label-bold font-label-bold uppercase tracking-wider text-on-surface mb-1.5"
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
                  className="h-14 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-3.5 text-body-base font-body-base text-on-surface placeholder:text-outline transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="h-14 w-full justify-center rounded-lg bg-primary-container text-sm font-label-bold tracking-wide shadow-sm hover:bg-primary"
              >
                {isSubmitting ? 'Creating Inspector Account...' : 'Register Inspector Account'}
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-3 border-t border-outline-variant/60">
              <p className="text-body-sm font-body-sm text-on-surface-variant">
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
      <footer className="w-full max-w-5xl py-4 flex flex-col sm:flex-row justify-between items-center text-body-sm font-body-sm text-on-surface-variant border-t border-outline-variant/60 gap-2">
        <div>© 2024–2026 PackIntel • Department of Consumer Affairs, Government of India</div>
        <div>Authorized Registration System</div>
      </footer>
    </div>
  );
}
