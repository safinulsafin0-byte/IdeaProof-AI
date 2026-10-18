"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Trash2,
  ChevronRight,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { ResearchAnalysis } from "@/types/research";
import { Badge } from "@/components/ui/Badge";
import { downloadFile, generateMarkdownReport } from "@/lib/storage";

interface ProjectTableProps {
  projects: ResearchAnalysis[];
  onDeleteProject: (id: string) => void;
}

export function ProjectTable({ projects, onDeleteProject }: ProjectTableProps) {
  const handleExportMarkdown = (e: React.MouseEvent, project: ResearchAnalysis) => {
    e.stopPropagation();
    e.preventDefault();
    const markdown = generateMarkdownReport(project);
    const slug = project.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40);
    downloadFile(markdown, `${slug}-ideaproof-report.md`);
  };

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`Remove "${title}" from workspace?`)) {
      onDeleteProject(id);
    }
  };

  return (
    <div className="w-full bg-white border border-[#E5E5E0] rounded-lg shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Research Title & Topic</th>
              <th className="py-3 px-4 hidden md:table-cell">Discipline & Level</th>
              <th className="py-3 px-4 hidden sm:table-cell">Last Updated</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E0] text-xs">
            {projects.map((project) => {
              const formattedDate = new Date(project.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <tr
                  key={project.id}
                  className="group hover:bg-[#FBFBF9] transition-colors"
                >
                  <td className="py-3.5 px-4 sm:px-6 max-w-sm sm:max-w-md">
                    <Link
                      href={`/analysis/${project.id}`}
                      className="block focus:outline-none"
                    >
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 mt-0.5 shrink-0 text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
                        <div className="min-w-0">
                          <h4 className="font-medium text-[#18181B] group-hover:text-blue-900 group-hover:underline transition-colors line-clamp-1">
                            {project.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] text-[#64748B] line-clamp-1">
                            {project.topic}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#18181B] truncate max-w-[150px]">
                        {project.academicField || "General"}
                      </span>
                      <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-[#94A3B8]" />
                        {project.academicLevel}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 hidden sm:table-cell whitespace-nowrap text-[#64748B] text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#94A3B8]" />
                      {formattedDate}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {project.isDemo ? (
                      <Badge variant="demo" className="font-mono text-[10px]">
                        DEMO DATA
                      </Badge>
                    ) : (
                      <Badge variant="verified" className="font-mono text-[10px]">
                        LIVE ANALYSIS
                      </Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleExportMarkdown(e, project)}
                        className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F1ED] rounded transition-colors"
                        title="Download Markdown Report"
                        aria-label="Export Markdown"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, project.id, project.title)}
                        className="p-1.5 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete project"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/analysis/${project.id}`}
                        className="p-1.5 text-[#64748B] group-hover:text-[#0F172A] hover:bg-[#F1F1ED] rounded transition-colors inline-flex items-center"
                        title="View Full Report"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
