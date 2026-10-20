"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  AlertCircle,
  Lightbulb,
  Info,
  BookOpen,
} from "lucide-react";
import { AcademicLevel, ResearchAnalysis } from "@/types/research";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getUserPreferences, saveProject } from "@/lib/storage";
import { useIsMounted } from "@/lib/use-mounted";

const EXAMPLE_PROMPTS: {
  title: string;
  topic: string;
  question: string;
  field: string;
  level: AcademicLevel;
}[] = [
  {
    title: "Graph Neural Networks & Climate Extremes",
    topic:
      "Developing physics-informed spatio-temporal graph neural networks incorporating Navier-Stokes thermodynamic continuity to forecast localized urban heat anomalies 72 hours in advance.",
    question:
      "Can differential thermodynamic conservation penalties reduce spatial extrapolation errors during historically unprecedented urban heatwaves?",
    field: "Climate Science / Machine Learning",
    level: "PhD",
  },
  {
    title: "Semi-Supervised Clinical NER",
    topic:
      "Investigating contrastive token-level representation learning on unannotated clinical summaries to reduce annotated label requirements for rare genetic disease entity extraction.",
    question:
      "How do hard negative token pairings calibrated against medical ontologies compare to standard masked language modeling in few-shot clinical NER?",
    field: "Biomedical Informatics",
    level: "Master's",
  },
  {
    title: "Cryptographic Consensus Latency",
    topic:
      "Empirical benchmark of zero-knowledge validity rollups versus optimistic fraud proofs under simulated high-congestion network partitions in decentralized ledger systems.",
    question:
      "What is the quantitative throughput and finality degradation threshold when network packet loss exceeds 15% across geographically distributed validator nodes?",
    field: "Computer Science / Distributed Systems",
    level: "Undergraduate",
  },
];

const ACADEMIC_FIELDS = [
  "Computer Science",
  "Artificial Intelligence & Machine Learning",
  "Biomedical Informatics",
  "Clinical Medicine & Health",
  "Climate & Environmental Science",
  "Economics & Quantitative Finance",
  "Cognitive Science & Neuroscience",
  "Physics & Applied Mathematics",
  "Public Policy & Social Sciences",
  "Materials Science & Engineering",
];

const LEVEL_DESCRIPTIONS: Record<AcademicLevel, string> = {
  Undergraduate:
    "Prioritizes clearly bounded experimental scope, feasibility within 1-2 semesters, and reproducible baselines.",
  "Master's":
    "Focuses on rigorous comparative methodology, formal hypothesis validation, and empirical benchmarking against standard datasets.",
  PhD:
    "Demands novel theoretical contributions, deep ontological gaps, boundary-condition stress testing, and publication-ready evaluation designs.",
};

export function NewAnalysisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useIsMounted();

  const seedTopic = searchParams.get("seedTopic") || "";
  const seedRef = searchParams.get("seedRef") || "";

  const [topic, setTopic] = useState(seedTopic);
  const [researchQuestion, setResearchQuestion] = useState(
    seedRef ? `Investigating empirical boundaries and extensions of: ${seedRef}` : ""
  );
  const [customField, setCustomField] = useState<string | null>(null);
  const [customLevel, setCustomLevel] = useState<AcademicLevel | null>(null);

  const academicField = customField ?? (mounted ? getUserPreferences().primaryField || "Computer Science" : "Computer Science");
  const academicLevel = customLevel ?? (mounted ? getUserPreferences().defaultLevel || "Master's" : "Master's");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [missingKeyWarning, setMissingKeyWarning] = useState(false);

  const handleApplyExample = (ex: (typeof EXAMPLE_PROMPTS)[0]) => {
    setTopic(ex.topic);
    setResearchQuestion(ex.question);
    setCustomField(ex.field);
    setCustomLevel(ex.level);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || topic.trim().length < 10) {
      setErrorMessage("Please enter a research topic of at least 10 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setMissingKeyWarning(false);
    setLoadingStep("Connecting to NVIDIA Nemotron inference engine...");

    try {
      const prefs = getUserPreferences();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Check if user set a custom key in their client preferences
      const sessionKey = prefs.customApiKey || prefs.customNebiusApiKey;
      if (sessionKey) {
        headers["x-openrouter-api-key"] = sessionKey;
        headers["x-nebius-api-key"] = sessionKey;
      }
      if (prefs.selectedModel) {
        headers["x-openrouter-model"] = prefs.selectedModel;
        headers["x-nebius-model"] = prefs.selectedModel;
      }

      setLoadingStep("Formulating hypotheses and constructing methodology blueprint...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: topic.trim(),
          researchQuestion: researchQuestion.trim() || undefined,
          academicField: academicField.trim() || undefined,
          academicLevel,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const rawErr = errorData.error || "";

        if (res.status === 401 || res.status === 403 || rawErr.toLowerCase().includes("api_key") || rawErr.toLowerCase().includes("auth")) {
          setMissingKeyWarning(true);
          throw new Error(
            rawErr ||
              "Authentication failed: AI Provider API key is missing or invalid. Please check OPENROUTER_API_KEY in .env.local or your Settings."
          );
        }

        if (res.status === 429 || rawErr.toLowerCase().includes("rate limit")) {
          throw new Error(
            rawErr ||
              "Rate limit reached (HTTP 429). The model provider is currently experiencing high load. Please wait a brief moment and try again."
          );
        }

        if (res.status >= 500) {
          throw new Error(
            rawErr ||
              `AI provider service error (HTTP ${res.status}): The model service was unable to complete the request. Please verify connectivity in Settings.`
          );
        }

        throw new Error(rawErr || `Server responded with HTTP ${res.status}`);
      }

      setLoadingStep("Querying OpenAlex index for verified literature...");
      const analysis: ResearchAnalysis = await res.json();

      // Persist in client storage
      saveProject(analysis);

      // Navigate to results
      router.push(`/analysis/${analysis.id}`);
    } catch (err: unknown) {
      console.error("Analysis submission error:", err);
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : "Failed to analyze research idea.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#0F172A]">
              Validate Research Proposal
            </h2>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed max-w-2xl">
              Provide your proposed research problem or hypothesis. IdeaProof AI analyzes novelty gaps, formulates directional hypotheses, synthesizes execution milestones, and correlates with verified OpenAlex publications.
            </p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex shrink-0">
            NVIDIA Nemotron + OpenAlex
          </Badge>
        </div>
      </div>

      {/* Seed Reference Banner if coming from literature */}
      {seedRef && (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded bg-blue-50/80 border border-blue-200 text-xs text-blue-900">
          <BookOpen className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span>
            Seeded from literature publication: <strong className="font-semibold">{seedRef}</strong>
          </span>
        </div>
      )}

      {/* Example Prompt Presets */}
      <div className="bg-[#FAFAF8] border border-[#E5E5E0] rounded-lg p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] mb-2.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>Quick Example Presets</span>
          <span className="text-[10px] text-[#64748B] font-normal">(Click to load)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {EXAMPLE_PROMPTS.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyExample(ex)}
              className="text-left p-2.5 rounded bg-white border border-[#E5E5E0] hover:border-slate-400 hover:bg-[#FDFDFB] transition-all text-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-[#0F172A] group-hover:text-blue-900 truncate">
                  {ex.title}
                </span>
                <span className="text-[10px] text-[#64748B] bg-[#F1F1ED] px-1.5 py-0.2 rounded font-mono">
                  {ex.level}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                {ex.topic}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs space-y-5">
        {/* Topic Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="topic" className="block text-xs font-semibold text-[#0F172A]">
              Research Topic or Problem Statement <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-mono text-[#94A3B8]">
              {topic.length}/2500
            </span>
          </div>
          <textarea
            id="topic"
            rows={5}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={2500}
            required
            placeholder="e.g., Investigating whether fine-grained contrastive token representations on unannotated clinical discharge notes can alleviate data scarcity in clinical named entity recognition..."
            className="w-full text-xs sm:text-sm p-3 rounded bg-white border border-[#E5E5E0] placeholder:text-[#94A3B8] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] transition-all resize-y leading-relaxed"
          />
          <p className="mt-1 text-[11px] text-[#64748B]">
            State the core phenomenon, methodology hypothesis, or empirical dilemma you seek to investigate.
          </p>
        </div>

        {/* Optional Research Question */}
        <div>
          <label htmlFor="question" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Initial Research Question <span className="text-[#64748B] font-normal">(Optional)</span>
          </label>
          <input
            id="question"
            type="text"
            value={researchQuestion}
            onChange={(e) => setResearchQuestion(e.target.value)}
            placeholder="e.g., Can syntax-guided hard negative sampling prevent false negative collisions among clinically synonymous tokens?"
            className="w-full text-xs sm:text-sm px-3 py-2 rounded bg-white border border-[#E5E5E0] placeholder:text-[#94A3B8] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] transition-all"
          />
        </div>

        {/* Academic Field & Academic Level Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Academic Discipline
            </label>
            <select
              id="field"
              value={academicField}
              onChange={(e) => setCustomField(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded bg-white border border-[#E5E5E0] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] transition-all"
            >
              {ACADEMIC_FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Target Academic Level
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["Undergraduate", "Master's", "PhD"] as AcademicLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCustomLevel(level)}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium border text-center transition-all ${
                    academicLevel === level
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                      : "bg-white text-[#475569] border-[#E5E5E0] hover:bg-[#F9F9F7]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Level Expectations Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded bg-[#F8F8F6] border border-[#E5E5E0] text-[11px] text-[#64748B]">
          <Info className="w-4 h-4 shrink-0 text-[#64748B] mt-0.5" />
          <div>
            <span className="font-semibold text-[#18181B]">{academicLevel} Level Rigor Criteria: </span>
            {LEVEL_DESCRIPTIONS[academicLevel]}
          </div>
        </div>

        {/* Error message / Missing key guidance */}
        {errorMessage && (
          <div className="p-3.5 rounded bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold">Analysis Failed: </span>
                {errorMessage}
              </div>
            </div>
            {missingKeyWarning && (
              <div className="pl-6 pt-1 text-[11px] text-red-800 space-y-1">
                <p>
                  To run live inference with NVIDIA Nemotron, configure <code className="px-1 py-0.5 bg-red-100 rounded font-mono">OPENROUTER_API_KEY</code> in your <code className="px-1 py-0.5 bg-red-100 rounded font-mono">.env.local</code> file or input it in the Settings page.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1 font-semibold underline hover:text-red-950"
                  >
                    Open Settings Page
                  </Link>
                  <span className="text-red-400">•</span>
                  <Link
                    href="/analysis/demo-contrastive-biomed"
                    className="inline-flex items-center gap-1 font-semibold underline hover:text-red-950"
                  >
                    View Sample Demonstration Analysis
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button & Progress indicator */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E5E5E0]">
          <div className="text-[11px] text-[#64748B]">
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-blue-900 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                {loadingStep || "Processing..."}
              </span>
            ) : (
              <span>Structured peer-review blueprint with verified OpenAlex literature metadata.</span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading || !topic.trim() || topic.trim().length < 10}
            icon={<Sparkles className="w-4 h-4 text-slate-200" />}
            className="w-full sm:w-auto"
          >
            Analyze Idea
          </Button>
        </div>
      </form>
    </div>
  );
}
