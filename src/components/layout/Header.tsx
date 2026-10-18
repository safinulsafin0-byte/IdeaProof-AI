"use client";

import React from "react";
import { Menu, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  actions?: React.ReactNode;
}

export function Header({
  title = "Research workspace",
  subtitle,
  onOpenMobileMenu,
  actions,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-[#FAFAF8]/90 backdrop-blur-xs border-b border-[#E5E5E0] no-print">
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-1.5 -ml-1 text-slate-600 rounded md:hidden hover:bg-slate-100"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-[#0F172A] truncate">
              {title}
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-slate-100 text-slate-600 border border-slate-200">
              v1.0
            </span>
          </div>
          {subtitle && (
            <p className="hidden text-xs text-[#64748B] sm:block truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {actions ? (
          actions
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/literature"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-[#E5E5E0] rounded hover:bg-[#F9F9F7] shadow-2xs transition-colors"
            >
              <span>Explore Literature</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/analyze"
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#0F172A] rounded hover:bg-[#1E293B] shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
