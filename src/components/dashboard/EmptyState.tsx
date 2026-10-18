"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, FileText, BookOpen, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  onLoadDemoData?: () => void;
}

export function EmptyState({ onLoadDemoData }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-[#E5E5E0] rounded-lg shadow-2xs max-w-2xl mx-auto my-8">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#F4F4F0] border border-[#E5E5E0] text-[#0F172A]">
        <BookOpen className="w-6 h-6 stroke-[1.75]" />
      </div>

      <h3 className="text-base font-semibold tracking-tight text-[#0F172A] sm:text-lg">
        No research projects in workspace
      </h3>
      <p className="mt-1.5 text-xs text-[#64748B] max-w-md leading-relaxed">
        Start by evaluating a research idea. IdeaProof AI synthesizes structured problem statements, formal hypotheses, methodology blueprints, and retrieves verified literature.
      </p>

      {/* Feature pillars preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-6 text-left">
        <div className="p-3 rounded bg-[#FAFAF8] border border-[#E5E5E0]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
            <span>Nemotron AI</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-normal">
            Formal hypothesis derivation & execution risk mapping.
          </p>
        </div>

        <div className="p-3 rounded bg-[#FAFAF8] border border-[#E5E5E0]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] mb-1">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>OpenAlex Index</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-normal">
            Real DOIs, verified citations & direct journal links.
          </p>
        </div>

        <div className="p-3 rounded bg-[#FAFAF8] border border-[#E5E5E0]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] mb-1">
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            <span>Export & Print</span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-normal">
            Clean Markdown reports and browser print-to-PDF formatting.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/analyze">
          <Button variant="primary" size="md" icon={<ArrowRight className="w-3.5 h-3.5" />}>
            Analyze an idea
          </Button>
        </Link>

        {onLoadDemoData && (
          <Button
            variant="secondary"
            size="md"
            onClick={onLoadDemoData}
            icon={<FileText className="w-3.5 h-3.5 text-amber-700" />}
          >
            Load sample demonstration projects
          </Button>
        )}
      </div>
    </div>
  );
}

