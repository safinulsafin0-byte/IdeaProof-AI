"use client";

import React, { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AnalysisReportView } from "@/components/analysis/AnalysisReportView";
import { Button } from "@/components/ui/Button";
import { getProjectById } from "@/lib/storage";
import { DEMO_PROJECTS } from "@/lib/demo-data";

function AnalysisResultContent() {
  const params = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const id = typeof params?.id === "string" ? params.id : "";
  const analysis = getProjectById(id) || DEMO_PROJECTS.find((p) => p.id === id) || null;

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={analysis ? "Analysis Blueprint" : "Research Report"}
          subtitle={analysis ? `${analysis.academicLevel} • ${analysis.academicField}` : undefined}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {analysis ? (
            <AnalysisReportView analysis={analysis} />
          ) : (
            <div className="max-w-md mx-auto p-8 text-center bg-white border border-[#E5E5E0] rounded-lg shadow-2xs my-12">
              <FileQuestion className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#0F172A]">Research Report Not Found</h3>
              <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                The requested research analysis could not be located in your local workspace or benchmark archive.
              </p>
              <div className="mt-5">
                <Link href="/">
                  <Button variant="primary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                    Return to Workspace
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AnalysisResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
          <span className="text-xs text-[#64748B]">Loading analysis report...</span>
        </div>
      }
    >
      <AnalysisResultContent />
    </Suspense>
  );
}
