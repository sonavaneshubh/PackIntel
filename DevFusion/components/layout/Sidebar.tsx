"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: "dashboard",
      isActive: pathname === "/" || pathname === "/dashboard",
    },
    {
      label: "New Scan",
      href: "/scan/new",
      icon: "barcode_scanner",
      isActive: pathname.startsWith("/scan"),
    },
    {
      label: "Scan History",
      href: "/history",
      icon: "history",
      isActive: pathname === "/history",
    },
    {
      label: "Compliance Results",
      href: "/results",
      icon: "assignment_turned_in",
      isActive: pathname === "/results",
    },
    {
      label: "Rule Database",
      href: "/rules",
      icon: "gavel",
      isActive: pathname === "/rules",
    },
    {
      label: "Reports",
      href: "/reports",
      icon: "description",
      isActive: pathname === "/reports",
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: "analytics",
      isActive: pathname === "/analytics",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: "settings",
      isActive: pathname === "/settings",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "flex flex-col w-[260px] h-screen fixed left-0 top-0 py-6 z-40 bg-surface-container-low border-r border-outline-variant transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo / Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-primary transition-colors">
              S
            </div>
            <div>
              <h1 className="text-headline-md font-headline-md font-black text-primary leading-none">
                LabelGuard AI
              </h1>
              <p className="text-label-bold font-label-bold text-on-surface-variant text-[11px] mt-0.5">
                Compliance Engine v1.0
              </p>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-75 text-label-bold font-label-bold active:scale-95",
                item.isActive
                  ? "text-primary bg-surface-container-highest border-l-4 border-primary rounded-l-none font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary",
              )}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{
                  fontVariationSettings: item.isActive
                    ? "'FILL' 1"
                    : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Support & Sign Out */}
        <div className="mt-auto px-2 pt-4 border-t border-outline-variant space-y-1">
          <Link
            href="/support"
            onClick={onClose}
            className="flex items-center gap-2 text-on-surface-variant px-4 py-3 rounded-lg hover:bg-surface-container-high hover:text-primary transition-all duration-75 text-label-bold font-label-bold"
          >
            <span className="material-symbols-outlined text-[20px]">
              contact_support
            </span>
            <span>Support</span>
          </Link>
          <button
            onClick={() => {
              if (onClose) onClose();
              alert("Signed out successfully.");
            }}
            className="w-full flex items-center gap-2 text-on-surface-variant px-4 py-3 rounded-lg hover:bg-surface-container-high hover:text-primary transition-all duration-75 text-label-bold font-label-bold text-left"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
