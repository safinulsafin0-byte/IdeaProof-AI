"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectTable } from "@/components/dashboard/ProjectTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ResearchAnalysis } from "@/types/research";
import { deleteProject, getStoredProjects, resetToDemoProjects } from "@/lib/storage";
import { useIsMounted } from "@/lib/use-mounted";

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useIsMounted();
  const [localProjects, setLocalProjects] = useState<ResearchAnalysis[] | null>(null);

  const projects = localProjects ?? (mounted ? getStoredProjects() : []);

  const handleDeleteProject = (id: string) => {
    const updated = deleteProject(id);
    setLocalProjects(updated);
  };

  const handleLoadDemoData = () => {
    const reloaded = resetToDemoProjects();
    setLocalProjects(reloaded);
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Research workspace"
          subtitle="Idea proofing, formal hypotheses, and verified academic literature"
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          actions={
            <Link href="/analyze">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Analyze an idea
              </Button>
            </Link>
          }
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Compact Introduction Card */}
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#0F172A]">
                    Academic Research Validation & Methodology Planner
                  </h2>
                  <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
                    NVIDIA Nemotron
                  </Badge>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Evaluate research topics with academic rigor. Deconstruct scientific questions into testable hypotheses, identify literature gaps, plan multi-phase methodology, and match against 250M+ verified peer-reviewed publications.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link href="/analyze">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Sparkles className="w-3.5 h-3.5 text-slate-200" />}
                  >
                    Analyze an idea
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Workspace Projects Section Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  Recent Research Projects
                </h3>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[#EAEAE6] text-[#64748B]">
                  {mounted ? projects.length : "—"}
                </span>
              </div>

              {mounted && projects.length > 0 && (
                <div className="flex items-center gap-3 text-xs text-[#64748B]">
                  <Link
                    href="/literature"
                    className="hover:text-[#0F172A] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Literature Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Project Table or Empty State */}
            {mounted ? (
              projects.length > 0 ? (
                <ProjectTable
                  projects={projects}
                  onDeleteProject={handleDeleteProject}
                />
              ) : (
                <EmptyState onLoadDemoData={handleLoadDemoData} />
              )
            ) : (
              <div className="p-8 text-center bg-white border border-[#E5E5E0] rounded-lg">
                <span className="text-xs text-[#64748B]">Loading workspace projects...</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
