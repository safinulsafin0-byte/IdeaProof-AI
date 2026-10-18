"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  Sparkles,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { VerifiedPaper, LiteratureSearchResponse } from "@/types/research";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const SUGGESTED_QUERIES = [
  "contrastive learning clinical NER",
  "physics informed neural networks Navier Stokes",
  "knowledge distillation large language models",
  "retrieval augmented generation hallucination",
  "spatio temporal graph forecasting",
];

export function LiteratureExplorerView() {
  const router = useRouter();

  const [query, setQuery] = useState("contrastive learning clinical NER");
  const [fromYear, setFromYear] = useState<string>("");
  const [toYear, setToYear] = useState<string>("");
  const [isOpenAccessOnly, setIsOpenAccessOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "cited_by_count:desc" | "publication_year:desc">("relevance");
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<VerifiedPaper[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLiterature = async (searchQuery: string, pageNum = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("query", searchQuery.trim());
      params.set("page", pageNum.toString());
      params.set("perPage", "12");
      params.set("sortBy", sortBy);
      if (isOpenAccessOnly) params.set("isOpenAccessOnly", "true");
      if (fromYear) params.set("fromYear", fromYear);
      if (toYear) params.set("toYear", toYear);

      const res = await fetch(`/api/literature?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`OpenAlex index responded with HTTP ${res.status}`);
      }

      const data: LiteratureSearchResponse = await res.json();
      setResults(data.papers || []);
      setTotalCount(data.totalCount || 0);
      setPage(data.page || 1);
    } catch (err: unknown) {
      console.error("Literature search error:", err);
      setError(err instanceof Error ? err.message : "Failed to retrieve publications.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial search safely on mount
  useEffect(() => {
    let ignore = false;
    const initialFetch = async () => {
      try {
        const params = new URLSearchParams({
          query: "contrastive learning clinical NER",
          page: "1",
          perPage: "12",
          sortBy: "relevance",
        });
        const res = await fetch(`/api/literature?${params.toString()}`);
        if (!res.ok) return;
        const data: LiteratureSearchResponse = await res.json();
        if (!ignore) {
          setResults(data.papers || []);
          setTotalCount(data.totalCount || 0);
          setPage(data.page || 1);
        }
      } catch {
        // Handled silently
      }
    };

    initialFetch();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLiterature(query, 1);
  };

  const handleSeedAnalysis = (paper: VerifiedPaper) => {
    const initialTopic = `Investigating extensions to "${paper.title}" with novel experimental baselines and ablation tests.`;
    const searchParams = new URLSearchParams();
    searchParams.set("seedTopic", initialTopic);
    searchParams.set("seedRef", paper.doi || paper.url || paper.title);
    router.push(`/analyze?${searchParams.toString()}`);
  };

  const handleCopyCitation = (paper: VerifiedPaper) => {
    const citation = `${paper.authors.join(", ")} (${paper.publicationYear || "n.d."}). ${paper.title}. ${paper.source}. ${paper.doi || paper.url || ""}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(paper.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E0] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#0F172A]">
              OpenAlex Literature Explorer
            </h2>
            <p className="text-xs text-[#64748B]">
              Query 250M+ verified peer-reviewed publications. Metadata, citations, and DOIs are retrieved live from OpenAlex and never fabricated.
            </p>
          </div>
          <Badge variant="verified" className="text-[10px] font-mono shrink-0">
            OpenAlex API Connected
          </Badge>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by topic, paper title, concept, or methodology..."
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded bg-white border border-[#E5E5E0] placeholder:text-[#94A3B8] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] transition-all"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              icon={<Search className="w-3.5 h-3.5" />}
            >
              Search Literature
            </Button>
          </div>

          {/* Quick Query Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#64748B]">
            <span className="font-medium text-[#475569]">Suggested Topics:</span>
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(q);
                  fetchLiterature(q, 1);
                }}
                className="px-2 py-0.5 rounded bg-[#F4F4F0] hover:bg-[#EBEBE6] text-[#334155] border border-[#E5E5E0] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-[#E5E5E0]/70">
            <div className="flex items-center gap-1.5 text-[#64748B]">
              <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="font-medium">Filters:</span>
            </div>

            {/* Year Filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B]">Year:</span>
              <input
                type="number"
                placeholder="From"
                value={fromYear}
                onChange={(e) => setFromYear(e.target.value)}
                className="w-16 px-1.5 py-1 text-xs rounded border border-[#E5E5E0] text-center"
              />
              <span className="text-[#94A3B8]">–</span>
              <input
                type="number"
                placeholder="To"
                value={toYear}
                onChange={(e) => setToYear(e.target.value)}
                className="w-16 px-1.5 py-1 text-xs rounded border border-[#E5E5E0] text-center"
              />
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  const val = e.target.value as typeof sortBy;
                  setSortBy(val);
                }}
                className="px-2 py-1 text-xs rounded border border-[#E5E5E0] bg-white text-[#18181B]"
              >
                <option value="relevance">Relevance</option>
                <option value="cited_by_count:desc">Most Cited</option>
                <option value="publication_year:desc">Newest First</option>
              </select>
            </div>

            {/* Open Access Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-[#475569] select-none">
              <input
                type="checkbox"
                checked={isOpenAccessOnly}
                onChange={(e) => setIsOpenAccessOnly(e.target.checked)}
                className="rounded border-[#E5E5E0] text-[#0F172A] focus:ring-0"
              />
              <span>Open Access Only</span>
            </label>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
        <span>
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F172A]" />
              Querying OpenAlex live index...
            </span>
          ) : (
            <span>
              Found <strong className="text-[#0F172A]">{totalCount.toLocaleString()}</strong> verified publications for &ldquo;{query}&rdquo;
            </span>
          )}
        </span>
        <span className="text-[11px] font-mono">Page {page}</span>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Failed to fetch papers:</span>
            <p className="mt-0.5 text-red-800">{error}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchLiterature(query, page)}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Results Table */}
      {!isLoading && results.length === 0 && !error ? (
        <div className="p-12 text-center bg-white border border-[#E5E5E0] rounded-lg">
          <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-[#0F172A]">No publications found</h4>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, broadening the publication year range, or removing the Open Access filter.
          </p>
        </div>
      ) : (
        <div className="w-full bg-white border border-[#E5E5E0] rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E0] bg-[#FAFAF8] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Paper Title & Authors</th>
                  <th className="py-3 px-3 hidden md:table-cell">Venue</th>
                  <th className="py-3 px-3 text-center">Year</th>
                  <th className="py-3 px-3 hidden lg:table-cell">DOI Identifier</th>
                  <th className="py-3 px-3 text-right">Citations</th>
                  <th className="py-3 px-3 text-center">Access</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E0] text-xs">
                {isLoading && results.length === 0 ? (
                  // Skeleton Loading Rows
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="h-4 bg-[#F1F1ED] rounded w-3/4 mb-1.5" />
                        <div className="h-3 bg-[#F1F1ED] rounded w-1/2" />
                      </td>
                      <td className="py-4 px-3 hidden md:table-cell">
                        <div className="h-3 bg-[#F1F1ED] rounded w-24" />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <div className="h-3 bg-[#F1F1ED] rounded w-10 mx-auto" />
                      </td>
                      <td className="py-4 px-3 hidden lg:table-cell">
                        <div className="h-3 bg-[#F1F1ED] rounded w-28" />
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="h-3 bg-[#F1F1ED] rounded w-8 ml-auto" />
                      </td>
                      <td className="py-4 px-3 text-center">
                        <div className="h-4 bg-[#F1F1ED] rounded w-14 mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="h-6 bg-[#F1F1ED] rounded w-20 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  results.map((paper) => {
                    const isExpanded = expandedId === paper.id;
                    const cleanDoi = paper.doi ? paper.doi.replace("https://doi.org/", "") : null;

                    return (
                      <React.Fragment key={paper.id}>
                        <tr className="group hover:bg-[#FBFBF9] transition-colors">
                          <td className="py-3.5 px-4 sm:px-6 max-w-sm sm:max-w-md">
                            <div className="space-y-1">
                              <div className="flex items-start gap-1.5">
                                <h4 className="font-semibold text-[#0F172A] leading-snug line-clamp-2">
                                  {paper.title}
                                </h4>
                              </div>
                              <p className="text-[11px] text-[#64748B] line-clamp-1">
                                {paper.authors.join(", ")}
                              </p>
                              {paper.abstractSnippet && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(paper.id)}
                                  className="inline-flex items-center gap-1 text-[10px] text-blue-700 hover:text-blue-900 font-medium pt-0.5"
                                >
                                  <span>{isExpanded ? "Hide Abstract" : "Preview Abstract"}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-2.5 h-2.5" />
                                  ) : (
                                    <ChevronDown className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 hidden md:table-cell text-[11px] text-[#475569] max-w-[140px] truncate">
                            <span title={paper.source || ""}>
                              {paper.source || "Academic Repository"}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-center whitespace-nowrap text-[11px] text-[#64748B] font-mono">
                            {paper.publicationYear || "n.d."}
                          </td>

                          <td className="py-3.5 px-3 hidden lg:table-cell text-[11px] font-mono text-[#64748B] max-w-[150px] truncate">
                            {cleanDoi ? (
                              <a
                                href={paper.doi!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:underline inline-flex items-center gap-1"
                                title={paper.doi!}
                              >
                                <span className="truncate">{cleanDoi}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-[#94A3B8]">No DOI registered</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right whitespace-nowrap text-[11px] font-mono text-[#18181B]">
                            {paper.citedByCount.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            {paper.isOpenAccess ? (
                              <Badge variant="verified" className="text-[10px]">
                                <Unlock className="w-2.5 h-2.5 mr-1" />
                                OA
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-[#94A3B8]">
                                <Lock className="w-2.5 h-2.5 mr-1" />
                                Restr.
                              </Badge>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleCopyCitation(paper)}
                                className="px-2 py-1 text-[11px] text-[#475569] bg-white border border-[#E5E5E0] rounded hover:bg-[#F9F9F7] transition-colors"
                                title="Copy APA formatted citation"
                              >
                                {copiedId === paper.id ? (
                                  <span className="text-emerald-700 inline-flex items-center gap-1 font-medium">
                                    <Check className="w-3 h-3" />
                                    <span>Copied</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <Copy className="w-3 h-3" />
                                    <span>Cite</span>
                                  </span>
                                )}
                              </button>

                              <button
                                onClick={() => handleSeedAnalysis(paper)}
                                className="px-2 py-1 text-[11px] font-medium text-[#0F172A] bg-[#F4F4F0] border border-[#E5E5E0] rounded hover:bg-[#EAEAE6] transition-colors inline-flex items-center gap-1"
                                title="Seed new research analysis from this paper"
                              >
                                <Sparkles className="w-3 h-3 text-blue-700" />
                                <span>Seed</span>
                              </button>

                              {paper.doi ? (
                                <a
                                  href={paper.doi}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F1ED] rounded transition-colors"
                                  title="Open publisher landing page"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : paper.url ? (
                                <a
                                  href={paper.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F1ED] rounded transition-colors"
                                  title="Open repository landing page"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : null}
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Abstract Row */}
                        {isExpanded && paper.abstractSnippet && (
                          <tr className="bg-[#FAF9F5] border-b border-[#E5E5E0]">
                            <td colSpan={7} className="px-6 py-3.5">
                              <div className="space-y-1">
                                <span className="font-semibold text-[10px] uppercase tracking-wider text-[#64748B]">
                                  Abstract Excerpt (Verified via OpenAlex index)
                                </span>
                                <p className="text-xs text-[#334155] leading-relaxed italic bg-white p-3 rounded border border-[#E5E5E0]">
                                  &ldquo;{paper.abstractSnippet}&rdquo;
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {results.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => {
              const prev = Math.max(1, page - 1);
              setPage(prev);
              fetchLiterature(query, prev);
            }}
          >
            Previous Page
          </Button>

          <span className="text-xs text-[#64748B]">Page {page}</span>

          <Button
            variant="secondary"
            size="sm"
            disabled={results.length < 12 || isLoading}
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchLiterature(query, next);
            }}
          >
            Next Page
          </Button>
        </div>
      )}
    </div>
  );
}
