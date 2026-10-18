"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LiteratureExplorerView } from "@/components/literature/LiteratureExplorerView";

export default function LiteraturePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Literature Explorer"
          subtitle="Query 250M+ verified peer-reviewed publications via OpenAlex"
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <LiteratureExplorerView />
        </main>
      </div>
    </div>
  );
}

