"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, FolderKanban } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectTable } from "@/components/dashboard/ProjectTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/Button";
import { ResearchAnalysis } from "@/types/research";
import { deleteProject, getStoredProjects, resetToDemoProjects } from "@/lib/storage";

export default function ResearchListPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<ResearchAnalysis[]>(() => getStoredProjects());
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [isLoaded] = useState(true);

  const handleDeleteProject = (id: string) => {
    const updated = deleteProject(id);
    setProjects(updated);
  };

  const handleLoadDemoData = () => {
    const reloaded = resetToDemoProjects();
    setProjects(reloaded);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.topic.toLowerCase().includes(search.toLowerCase()) ||
      p.academicField.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || p.academicLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="My Research Projects"
          subtitle="All saved research blueprints and literature proofings"
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
          {/* Filter Bar */}
          <div className="bg-white border border-[#E5E5E0] rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded border border-[#E5E5E0] bg-[#FAFAF8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#64748B]">Level:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded border border-[#E5E5E0] bg-white text-[#18181B]"
              >
                <option value="ALL">All Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Master's">Master&apos;s</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoaded ? (
            filteredProjects.length > 0 ? (
              <ProjectTable
                projects={filteredProjects}
                onDeleteProject={handleDeleteProject}
              />
            ) : projects.length === 0 ? (
              <EmptyState onLoadDemoData={handleLoadDemoData} />
            ) : (
              <div className="p-12 text-center bg-white border border-[#E5E5E0] rounded-lg">
                <FolderKanban className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-[#0F172A]">No matching projects</h4>
                <p className="text-xs text-[#64748B] mt-1">Try clearing your search query or level filter.</p>
              </div>
            )
          ) : (
            <div className="p-8 text-center bg-white border border-[#E5E5E0] rounded-lg">
              <span className="text-xs text-[#64748B]">Loading workspace projects...</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
