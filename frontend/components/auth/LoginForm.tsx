'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const { signIn, signInWithDemo, user, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (user && !authLoading) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validation
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
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn({ email: trimmedEmail, password });
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage('Authentication service temporarily unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMessage(null);
    setIsDemoSubmitting(true);
    try {
      await signInWithDemo();
    } catch {
      setErrorMessage('Failed to sign in with demo account.');
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-surface border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Top Brand & Emblem Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl shadow-md mb-3 border border-primary/20">
          <span className="material-symbols-outlined text-[32px]">verified_user</span>
        </div>
        <h1 className="text-2xl font-bold font-sans text-on-surface tracking-tight">
          PackIntel
        </h1>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-0.5">
          Legal Metrology Compliance Inspection Platform
        </p>
        <p className="text-[11px] text-on-surface-variant mt-1.5 font-medium">
          Scan. Verify. Compare. Detect. Prioritize.
        </p>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">
            error
          </span>
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <label
            htmlFor="inspector_email"
            className="block text-xs font-label-bold font-semibold uppercase tracking-wider text-on-surface mb-1.5"
          >
            Inspector Email
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
              badge
            </span>
            <input
              id="inspector_email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter inspector email"
              disabled={isSubmitting || isDemoSubmitting}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="inspector_password"
              className="block text-xs font-label-bold font-semibold uppercase tracking-wider text-on-surface"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-primary hover:text-primary-container font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] pointer-events-none">
              lock
            </span>
            <input
              id="inspector_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter password"
              disabled={isSubmitting || isDemoSubmitting}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-10 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 p-1 text-outline hover:text-on-surface transition-colors cursor-pointer rounded"
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Submit Sign In Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isDemoSubmitting}
            className="w-full py-2.5 shadow-sm justify-center text-xs font-bold tracking-wide"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </span>
            )}
          </Button>
        </div>

        {/* Sign Up Link Option */}
        <div className="text-center pt-2">
          <p className="text-xs text-on-surface-variant">
            Don&apos;t have an inspector account yet?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </form>

      {/* Demo Section for SIH Presentation */}
      <div className="mt-5 pt-4 border-t border-outline-variant/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-label-bold font-bold uppercase tracking-wider text-on-surface-variant">
            SIH 2026 Evaluation
          </span>
          <span className="text-[9px] font-mono text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
            Instant Access
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleDemoSignIn}
          disabled={isSubmitting || isDemoSubmitting}
          className="w-full py-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:border-primary text-xs font-semibold justify-center shadow-none transition-colors"
        >
          {isDemoSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading Demo Account...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              Use Demo Inspector Account
            </span>
          )}
        </Button>
        <p className="text-[10px] text-center text-outline mt-1.5">
          Pre-configures authorized Legal Metrology officer credentials for live jury inspection.
        </p>
      </div>

      {/* Official Government Disclaimer */}
      <div className="mt-5 pt-3 border-t border-outline-variant/50 text-center">
        <p className="text-[10px] text-on-surface-variant flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-primary">security</span>
          Authorized Personnel Only • Ministry of Consumer Affairs, Govt. of India
        </p>
      </div>
    </div>
  );
}
