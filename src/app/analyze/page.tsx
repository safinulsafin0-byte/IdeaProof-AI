"use client";

import React, { useState, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { NewAnalysisForm } from "@/components/analysis/NewAnalysisForm";

export default function AnalyzePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="New Research Analysis"
          subtitle="Formulate testable hypotheses and evaluate literature viability"
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Suspense
            fallback={
              <div className="max-w-4xl mx-auto p-12 text-center bg-white border border-[#E5E5E0] rounded-lg">
                <span className="text-xs text-[#64748B]">Loading analysis form...</span>
              </div>
            }
          >
            <NewAnalysisForm />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
