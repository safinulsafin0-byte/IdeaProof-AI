"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  BookMarked,
  Settings,
  PlusCircle,
  FileCheck2,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "My Research",
      href: "/research",
      icon: FolderKanban,
      active: pathname.startsWith("/research") || pathname.startsWith("/analysis"),
    },
    {
      name: "Literature",
      href: "/literature",
      icon: BookMarked,
      active: pathname.startsWith("/literature"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#FAFAF8] border-r border-[#E5E5E0] transition-transform duration-200 ease-in-out md:static md:translate-x-0 no-print ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#E5E5E0]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-[#0F172A] text-white">
              <FileCheck2 className="w-4 h-4 text-slate-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-[#0F172A] group-hover:text-blue-900 transition-colors">
                IdeaProof AI
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#64748B]">
                Academic Validator
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded md:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Link
            href="/analyze"
            onClick={onCloseMobile}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-semibold text-white transition-all bg-[#0F172A] rounded hover:bg-[#1E293B] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0F172A]/30"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Analyze an idea</span>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
                  item.active
                    ? "bg-[#EAEAE6] text-[#0F172A] font-semibold"
                    : "text-[#475569] hover:bg-[#F2F2EE] hover:text-[#0F172A]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.active ? "text-[#0F172A]" : "text-[#64748B]"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Secondary Info / Model Status */}
        <div className="px-4 py-3 mx-3 mb-2 rounded bg-[#F4F4F0] border border-[#E5E5E0] text-[11px]">
          <div className="flex items-center justify-between font-medium text-[#475569] mb-1">
            <span>Inference Model</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="font-mono text-[10px] text-[#64748B] truncate" title="NVIDIA Nemotron 3 / 70B">
            NVIDIA Nemotron
          </div>
          <div className="mt-1 text-[10px] text-[#94A3B8]">
            Literature: OpenAlex Live
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-[#E5E5E0] bg-[#FAFAF8]">
          <div className="flex items-center justify-between p-2 rounded hover:bg-[#F1F1ED] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center w-7 h-7 text-xs font-semibold text-slate-700 bg-[#E2E8F0] rounded-full shrink-0">
                JV
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-[#18181B] truncate">
                  Dr. Julian Vance
                </span>
                <span className="text-[10px] text-[#64748B] truncate">
                  Principal Investigator
                </span>
              </div>
            </div>
            <Link
              href="/settings"
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-slate-700"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

