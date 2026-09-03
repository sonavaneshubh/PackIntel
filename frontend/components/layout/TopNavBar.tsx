'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

interface TopNavBarProps {
  onMenuToggle?: () => void;
  pageTitle?: string;
}

export function TopNavBar({ onMenuToggle, pageTitle = 'Dashboard' }: TopNavBarProps) {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsCount, setNotificationsCount] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ').filter(Boolean);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'IN';
  };

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center w-full px-4 md:px-6 h-16 bg-surface border-b border-outline-variant shadow-xs transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Dynamic page title */}
        <h2 className="text-headline-md font-headline-md font-bold text-on-surface hidden sm:block">
          {pageTitle}
        </h2>

        {/* Operational badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant ml-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-label-bold font-label-bold text-on-surface-variant text-[11px]">
            System Operational
          </span>
        </div>
      </div>

      {/* Center / Search bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
          <span className="material-symbols-outlined text-outline mr-2 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, manufacturers, rules, violations..."
            className="bg-transparent border-none outline-none w-full text-body-sm font-body-sm text-on-surface placeholder:text-outline"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-outline hover:text-on-surface text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* AI Services Online badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-label-bold font-label-bold text-primary px-3 py-1.5 rounded border border-primary-container bg-primary/5 text-xs">
          <span className="material-symbols-outlined text-[16px]">smart_toy</span>
          <span>Rule Engine v2.4.1</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setNotificationsCount(0);
            }}
            className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors relative"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined text-[22px]">
              notifications
            </span>
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-outline-variant">
                <span className="text-label-bold font-label-bold text-on-surface">
                  Inspection Alerts
                </span>
                <span className="text-[11px] text-primary">All caught up</span>
              </div>
              <div className="space-y-2 text-body-sm font-body-sm">
                <div className="p-2 rounded bg-red-50/60 border border-red-200/80">
                  <p className="font-semibold text-xs text-red-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    High Priority: SCN-10251
                  </p>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    XYZ Cooking Oil: Consumer Care missing & 90ml volume shrinkage.
                  </p>
                </div>
                <div className="p-2 rounded bg-amber-50/60 border border-amber-200/80">
                  <p className="font-semibold text-xs text-amber-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Cross-Surface Mismatch: SCN-10252
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    ABC Fruit Juice: Front MRP ₹120 differs from Back ₹100.
                  </p>
                </div>
                <div className="p-2 rounded bg-surface-container-low border border-outline-variant/60">
                  <p className="font-medium text-xs text-on-surface">
                    Legal Metrology Codified DB
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Rule database synchronized to v2.4.1 (Aug 2026 guidelines).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help button */}
        <Link
          href="/rules"
          className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors"
          title="Rule Database and Help"
        >
          <span className="material-symbols-outlined text-[22px]">help</span>
        </Link>

        <div className="h-6 w-px bg-outline-variant mx-1" />

        {/* User avatar and profile dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 cursor-pointer group p-1 rounded-lg hover:bg-surface-container-low transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-2xs">
              {getInitials(user?.name, user?.email)}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[140px]">
                {user?.name || 'Compliance Officer'}
              </p>
              <p className="text-[10px] text-on-surface-variant leading-tight truncate max-w-[140px]">
                {user?.department || 'Dept. of Consumer Affairs'}
              </p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-on-surface transition-colors">
              expand_more
            </span>
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-surface border border-outline-variant rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="pb-3 mb-2 border-b border-outline-variant/70">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    {user?.role || 'Legal Metrology Inspector'}
                  </span>
                </div>
                <p className="text-xs font-bold text-on-surface truncate">
                  {user?.name || 'Inspector'}
                </p>
                <p className="text-[11px] font-mono text-on-surface-variant truncate mt-0.5">
                  {user?.email || 'inspector@gov.in'}
                </p>
                <p className="text-[10px] text-outline font-mono mt-1">
                  ID: {user?.id?.slice(0, 16) || 'GOV-INSP-2026'}
                </p>
              </div>

              <div className="space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 text-xs text-on-surface p-2 rounded hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">
                    settings
                  </span>
                  <span>Engine Settings</span>
                </Link>

                <Link
                  href="/support"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 text-xs text-on-surface p-2 rounded hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">
                    contact_support
                  </span>
                  <span>Help & Support</span>
                </Link>

                <div className="pt-2 mt-1 border-t border-outline-variant/60">
                  <button
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2 text-xs font-semibold text-error p-2 rounded hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      logout
                    </span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
