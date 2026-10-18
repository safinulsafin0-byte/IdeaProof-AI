"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Download,
  Share2,
  ExternalLink,
  AlertTriangle,
  GraduationCap,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Check,
  Clock,
} from "lucide-react";
import { ResearchAnalysis, VerifiedPaper } from "@/types/research";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { downloadFile, generateMarkdownReport } from "@/lib/storage";

interface AnalysisReportViewProps {
  analysis: ResearchAnalysis;
}

export function AnalysisReportView({ analysis }: AnalysisReportViewProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportMarkdown = () => {
    const md = generateMarkdownReport(analysis);
    const slug = analysis.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 45);
    downloadFile(md, `${slug}-ideaproof-report.md`);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const formattedDate = new Date(analysis.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            icon={copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          >
            {copiedShare ? "Link Copied" : "Share"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportMarkdown}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Markdown
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print / Save to PDF
          </Button>
        </div>
      </div>

      {/* Main Report Container */}
      <article className="bg-white border border-[#E5E5E0] rounded-lg p-6 sm:p-10 shadow-2xs space-y-8 print-card">
        {/* Document Header & Metadata */}
        <header className="border-b border-[#E5E5E0] pb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {analysis.isDemo ? (
              <Badge variant="demo" className="font-mono text-[10px]">
                DEMONSTRATION BENCHMARK DATA
              </Badge>
            ) : (
              <Badge variant="verified" className="font-mono text-[10px]">
                LIVE NEMOTRON ANALYSIS
              </Badge>
            )}

            <Badge variant="default" className="text-[11px]">
              <GraduationCap className="w-3 h-3 mr-1 text-[#64748B]" />
              {analysis.academicLevel} Level
            </Badge>

            <Badge variant="outline" className="text-[11px]">
              {analysis.academicField}
            </Badge>

            <span className="text-[11px] text-[#64748B] ml-auto flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#94A3B8]" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] leading-snug">
            {analysis.title}
          </h1>

          <div className="p-3 rounded bg-[#FAFAF8] border border-[#E5E5E0] text-xs space-y-1">
            <span className="font-semibold text-[#0F172A]">Original Proposed Topic: </span>
            <p className="text-[#475569] leading-relaxed">{analysis.topic}</p>
            {analysis.researchQuestion && (
              <p className="pt-1 text-[#64748B]">
                <span className="font-semibold text-[#0F172A]">Core Query: </span>
                {analysis.researchQuestion}
              </p>
            )}
          </div>
        </header>

        {/* 1. Executive Summary */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              1. Executive Summary
            </h2>
            <div className="h-px flex-1 bg-[#E5E5E0]" />
          </div>
          <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line">
            {analysis.executiveSummary}
          </p>
        </section>

        {/* 2. Problem Statement */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              2. Scientific Problem Statement
            </h2>
            <div className="h-px flex-1 bg-[#E5E5E0]" />
          </div>
          <p className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line">
            {analysis.problemStatement}
          </p>
        </section>

        {/* 3. Research Questions & Hypotheses */}
        <section className="space-y-4 avoid-break-inside">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              3. Research Questions & Hypotheses
            </h2>
            <div className="h-px flex-1 bg-[#E5E5E0]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#0F172A]">Primary Research Questions</h3>
            <ul className="space-y-1.5 list-none pl-0">
              {analysis.researchQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-[#334155] p-2 rounded bg-[#FAFAF8] border border-[#E5E5E0]"
                >
                  <span className="font-mono font-semibold text-[#0F172A] shrink-0">
                    RQ{idx + 1}:
                  </span>
                  <span className="leading-relaxed">{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#0F172A]">Formal Directional Hypotheses</h3>
            <div className="grid grid-cols-1 gap-3">
              {analysis.hypotheses.map((h, idx) => (
                <div
                  key={h.id || idx}
                  className="p-3.5 rounded bg-white border border-[#E5E5E0] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-1.5">
                    <span className="font-semibold text-[#0F172A]">
                      Hypothesis Pair {idx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">ID: {h.id}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-2 rounded bg-[#FAFAF8] border border-[#E5E5E0]">
                      <span className="font-semibold text-[#64748B] block mb-1">
                        H0 (Null Hypothesis):
                      </span>
                      <p className="text-[#334155] leading-relaxed">{h.h0}</p>
                    </div>
                    <div className="p-2 rounded bg-[#EFF6FF] border border-[#BFDBFE]">
                      <span className="font-semibold text-[#1E40AF] block mb-1">
                        H1 (Alternative Hypothesis):
                      </span>
                      <p className="text-[#1E3A8A] leading-relaxed">{h.h1}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#64748B] pt-1 italic">
                    <span className="font-medium not-italic text-[#475569]">Theoretical Rationale: </span>
                    {h.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Potential Novelty & Research Gap (Explicitly marked as Preliminary) */}
        <section className="space-y-3 avoid-break-inside">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              4. Novelty & Research Gap Analysis
            </h2>
            <div className="h-px flex-1 bg-[#E5E5E0]" />
          </div>

          {/* Mandatory Preliminary Disclaimer Box */}
          <div className="p-3 rounded bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Preliminary Gap Assessment Notice</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {analysis.potentialNoveltyAndGap.preliminaryNotice}
              </p>
            </div>
          </div>

          <div className="p-4 rounded bg-white border border-[#E5E5E0] space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
              <span className="text-[#64748B]">Synthesized Novelty Degree:</span>
              <Badge variant="accent" className="font-semibold">
                {analysis.potentialNoveltyAndGap.noveltyAssessment} Novelty
              </Badge>
            </div>
            <div>
              <span className="font-semibold text-[#0F172A] block mb-1">Theoretical & Empirical Gap:</span>
              <p className="text-[#334155] leading-relaxed">
                {analysis.potentialNoveltyAndGap.gapDescription}
              </p>
            </div>
            <div>
              <span className="font-semibold text-[#0F172A] block mb-1">Differentiation from Existing Baselines:</span>
              <p className="text-[#334155] leading-relaxed">
                {analysis.potentialNoveltyAndGap.differentiationFromPriorWork}
              </p>
            </div>
          </div>
        </section>

        {/* 5. Suggested Methodology */}
        <section className="space-y-3 avoid-break-inside">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              5. Suggested Execution Methodology
            </h2>
            <div className="h-px flex-1 bg-[#E5E5E0]" />
          </div>

          <div className="p-3 rounded bg-[#FAFAF8] border border-[#E5E5E0] text-xs">
            <span className="font-semibold text-[#0F172A]">Methodological Framework: </span>
            <span className="text-[#334155]">{analysis.suggestedMethodology.framework}</span>
          </div>

          {/* Execution Phases Timeline */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#0F172A]">Phase-by-Phase Roadmap</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {analysis.suggestedMethodology.phases.map((phase) => (
                <div
                  key={phase.phaseNumber}
                  className="p-3.5 rounded bg-white border border-[#E5E5E0] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A]">
                      Phase {phase.phaseNumber}: {phase.title}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#94A3B8]" />
                      {phase.durationWeeks}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                    <div>
                      <span className="font-medium text-[#475569] block mb-1">Key Activities:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[#334155]">
                        {phase.activities.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-medium text-[#475569] block mb-1">Deliverables & Milestones:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[#334155]">
                        {phase.deliverables.map((del, i) => (
                          <li key={i}>{del}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Baseline Comparison Models */}
          <div className="p-3 rounded bg-[#FAFAF8] border border-[#E5E5E0] text-xs">
            <span className="font-semibold text-[#0F172A] block mb-1">Recommended Benchmark Baselines:</span>
            <div className="flex flex-wrap gap-1.5">
              {analysis.suggestedMethodology.baselineMethods.map((b, i) => (
                <Badge key={i} variant="outline" className="bg-white text-[#334155]">
                  {b}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Datasets & Evaluation Metrics */}
        <section className="space-y-4 avoid-break-inside">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              6. Dataset Specifications & Evaluation Metrics
            </h2>
            <div className="h-px flex-1 bg-[#E5E5E0]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Datasets */}
            <div className="p-4 rounded bg-white border border-[#E5E5E0] space-y-2.5">
              <h3 className="font-semibold text-[#0F172A] border-b border-[#E5E5E0] pb-1.5">
                Data Requirements & Sources
              </h3>
              <div>
                <span className="text-[#64748B] block mb-1">Required Modalities & Types:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[#334155]">
                  {analysis.datasetRequirements.requiredDataTypes.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[#64748B] block mb-1">Recommended Repositories:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[#334155]">
                  {analysis.datasetRequirements.recommendedSources.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 rounded bg-[#FAFAF8] border border-[#E5E5E0] text-[11px] text-[#475569]">
                <span className="font-semibold text-[#0F172A]">Sample Size & Power Analysis: </span>
                {analysis.datasetRequirements.sampleSizeConsiderations}
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4 rounded bg-white border border-[#E5E5E0] space-y-2.5">
              <h3 className="font-semibold text-[#0F172A] border-b border-[#E5E5E0] pb-1.5">
                Evaluation Metrics & Criteria
              </h3>
              <div>
                <span className="text-[#64748B] block mb-1">Quantitative Metrics:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.evaluationMetrics.quantitativeMetrics.map((m, i) => (
                    <Badge key={i} variant="default" className="text-[11px]">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#64748B] block mb-1">Qualitative Criteria:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[#334155]">
                  {analysis.evaluationMetrics.qualitativeCriteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[#64748B] block mb-1">Standard Benchmark Suites:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.evaluationMetrics.benchmarkDatasets.map((b, i) => (
                    <Badge key={i} variant="outline" className="text-[11px]">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Limitations & Risk Analysis */}
        <section className="space-y-3 avoid-break-inside">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
              7. Feasibility, Methodological & Ethical Risks
            </h2>
            <div className="h-px flex-1 bg-[#E5E5E0]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded bg-white border border-[#E5E5E0] space-y-1.5">
              <span className="font-semibold text-[#0F172A] block">Feasibility & Compute</span>
              <ul className="list-disc pl-4 space-y-1 text-[#334155] text-[11px]">
                {analysis.limitationsAndRisks.feasibilityRisks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded bg-white border border-[#E5E5E0] space-y-1.5">
              <span className="font-semibold text-[#0F172A] block">Methodological Confounders</span>
              <ul className="list-disc pl-4 space-y-1 text-[#334155] text-[11px]">
                {analysis.limitationsAndRisks.methodologicalRisks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded bg-white border border-[#E5E5E0] space-y-1.5">
              <span className="font-semibold text-[#0F172A] block">Ethics & Data Governance</span>
              <ul className="list-disc pl-4 space-y-1 text-[#334155] text-[11px]">
                {analysis.limitationsAndRisks.ethicalConsiderations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Verified Related Literature (Separated & Verified) */}
        <section className="space-y-4 page-break-before">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                  8. Verified Related Literature
                </h2>
                <Badge variant="verified" className="text-[10px] font-mono">
                  OPENALEX INDEX VERIFIED
                </Badge>
              </div>
              <p className="mt-0.5 text-[11px] text-[#64748B]">
                The publications below are retrieved directly from the OpenAlex academic registry. Titles, authors, DOIs, and citations are verified and never fabricated.
              </p>
            </div>
          </div>

          {analysis.verifiedLiterature && analysis.verifiedLiterature.length > 0 ? (
            <div className="space-y-3">
              {analysis.verifiedLiterature.map((paper: VerifiedPaper, idx: number) => (
                <div
                  key={paper.id || idx}
                  className="p-4 rounded bg-[#FAFAF8] border border-[#E5E5E0] hover:border-slate-400 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] text-[#64748B] block mb-0.5">
                        [{idx + 1}] Academic Source
                      </span>
                      <h4 className="font-semibold text-[#0F172A] text-sm leading-snug">
                        {paper.title}
                      </h4>
                    </div>

                    {paper.isOpenAccess && (
                      <Badge variant="verified" className="shrink-0 text-[10px]">
                        Open Access
                      </Badge>
                    )}
                  </div>

                  {/* Authors & Publication Year */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#475569]">
                    <span>
                      <span className="font-medium text-[#18181B]">Authors: </span>
                      {paper.authors.join(", ")}
                    </span>
                    {paper.publicationYear && (
                      <span className="text-[#64748B]">({paper.publicationYear})</span>
                    )}
                    <span className="text-[#94A3B8]">•</span>
                    <span className="italic text-[#475569]">{paper.source}</span>
                  </div>

                  {/* Abstract snippet if present */}
                  {paper.abstractSnippet && (
                    <p className="text-[11px] text-[#64748B] bg-white p-2.5 rounded border border-[#E5E5E0] leading-relaxed">
                      &ldquo;{paper.abstractSnippet}&rdquo;
                    </p>
                  )}

                  {/* Verified Links & Citation counts */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E5E5E0]/70 text-[11px]">
                    <div className="flex items-center gap-3 text-[#64748B]">
                      <span>
                        <span className="font-medium text-[#18181B]">{paper.citedByCount.toLocaleString()}</span> citations in index
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {paper.doi ? (
                        <a
                          href={paper.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-blue-700 hover:underline"
                        >
                          <span>DOI: {paper.doi.replace("https://doi.org/", "")}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : paper.url ? (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-700 hover:underline"
                        >
                          <span>Open Location</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded bg-[#FAFAF8] border border-[#E5E5E0] text-xs text-[#64748B]">
              No exact publications directly matched the synthesized search keywords. Use Literature Explorer to query by custom keywords.
            </div>
          )}
        </section>

        {/* Report Footer */}
        <footer className="border-t border-[#E5E5E0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>IdeaProof AI — Academic Idea Validation Platform</span>
          </div>
          <div className="font-mono text-[10px]">
            Inference: {analysis.modelUsed || "NVIDIA Nemotron"}
          </div>
        </footer>
      </article>
    </div>
  );
}
