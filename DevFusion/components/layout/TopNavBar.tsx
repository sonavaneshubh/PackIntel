'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface TopNavBarProps {
  onMenuToggle?: () => void;
  pageTitle?: string;
}

export function TopNavBar({ onMenuToggle, pageTitle = 'Dashboard' }: TopNavBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsCount, setNotificationsCount] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);

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
            placeholder="Search rules, entities, scans..."
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
          <span>AI Services Online</span>
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
                  Notifications
                </span>
                <span className="text-[11px] text-primary">All caught up</span>
              </div>
              <div className="space-y-2 text-body-sm font-body-sm">
                <div className="p-2 rounded bg-surface-container-low border border-outline-variant/60">
                  <p className="font-medium text-xs text-on-surface">
                    Legal Metrology Rule Update
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Rule database updated to version v2.4.1 (Aug 2026 guidelines).
                  </p>
                </div>
                <div className="p-2 rounded bg-surface-container-low border border-outline-variant/60">
                  <p className="font-medium text-xs text-on-surface">
                    Scan Alert: SCN-10247
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Cooking Oil 1 L requires review on Packing Date declaration.
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

        {/* User avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full border border-outline-variant overflow-hidden bg-primary-container text-on-primary flex items-center justify-center font-semibold text-xs shadow-2xs">
            JD
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-on-surface leading-tight">
              Compliance Officer
            </p>
            <p className="text-[10px] text-on-surface-variant leading-tight">
              Dept. of Consumer Affairs
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
