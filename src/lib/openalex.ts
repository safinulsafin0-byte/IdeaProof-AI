import { LiteratureSearchFilters, LiteratureSearchResponse, VerifiedPaper } from "@/types/research";

interface OpenAlexAuthorEntry {
  author?: {
    display_name?: string;
  };
}

interface OpenAlexWork {
  id: string;
  doi?: string | null;
  title?: string | null;
  publication_year?: number | null;
  authorships?: OpenAlexAuthorEntry[];
  primary_location?: {
    source?: {
      display_name?: string | null;
    } | null;
    landing_page_url?: string | null;
    pdf_url?: string | null;
  } | null;
  open_access?: {
    is_oa?: boolean;
    oa_url?: string | null;
  } | null;
  cited_by_count?: number;
  abstract_inverted_index?: Record<string, number[]> | null;
}

interface OpenAlexApiResponse {
  results?: OpenAlexWork[];
  meta?: {
    count?: number;
    page?: number;
    per_page?: number;
  };
}

function reconstructAbstract(invertedIndex?: Record<string, number[]> | null, maxWords = 45): string | undefined {
  if (!invertedIndex || typeof invertedIndex !== "object") return undefined;

  const wordPositionPairs: [number, string][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        if (typeof pos === "number" && pos < 80) {
          wordPositionPairs.push([pos, word]);
        }
      }
    }
  }

  if (wordPositionPairs.length === 0) return undefined;
  wordPositionPairs.sort((a, b) => a[0] - b[0]);

  const reconstructed = wordPositionPairs
    .slice(0, maxWords)
    .map((pair) => pair[1])
    .join(" ");

  return reconstructed ? `${reconstructed}...` : undefined;
}

/**
 * Searches real academic literature from OpenAlex API.
 * Never fabricates DOIs, citations, or authors.
 */
export async function searchOpenAlex(filters: LiteratureSearchFilters): Promise<LiteratureSearchResponse> {
  const query = filters.query?.trim();
  if (!query) {
    return {
      papers: [],
      totalCount: 0,
      page: 1,
      perPage: filters.perPage || 10,
      query: "",
    };
  }

  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(25, Math.max(1, filters.perPage || 10));

  // Build query URL
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("per_page", perPage.toString());
  url.searchParams.set("mailto", "researcher@ideaproof.ai");

  // Filter criteria
  const filterClauses: string[] = [];
  if (filters.isOpenAccessOnly) {
    filterClauses.push("is_oa:true");
  }
  if (filters.fromYear && filters.toYear) {
    filterClauses.push(`publication_year:${filters.fromYear}-${filters.toYear}`);
  } else if (filters.fromYear) {
    filterClauses.push(`from_publication_date:${filters.fromYear}-01-01`);
  } else if (filters.toYear) {
    filterClauses.push(`to_publication_date:${filters.toYear}-12-31`);
  }

  if (filterClauses.length > 0) {
    url.searchParams.set("filter", filterClauses.join(","));
  }

  // Sorting
  if (filters.sortBy && filters.sortBy !== "relevance") {
    url.searchParams.set("sort", filters.sortBy);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "IdeaProof-AI/1.0 (academic research validator)",
      },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAlex API responded with status ${response.status}: ${response.statusText}`);
    }

    const data: OpenAlexApiResponse = await response.json();
    const rawResults = data.results || [];

    const papers: VerifiedPaper[] = rawResults.map((work) => {
      // Extract author names safely
      const authors = (work.authorships || [])
        .map((a) => a.author?.display_name?.trim())
        .filter((name): name is string => Boolean(name && name.length > 0))
        .slice(0, 8);

      // Best external destination link
      const resolvedUrl =
        work.doi ||
        work.open_access?.oa_url ||
        work.primary_location?.landing_page_url ||
        work.primary_location?.pdf_url ||
        work.id;

      return {
        id: work.id,
        title: work.title?.trim() || "Untitled Publication",
        authors: authors.length > 0 ? authors : ["Authors not listed in source index"],
        publicationYear: work.publication_year || null,
        doi: work.doi || null,
        source: work.primary_location?.source?.display_name || "Academic Venue / Repository",
        url: resolvedUrl,
        citedByCount: work.cited_by_count ?? 0,
        isOpenAccess: Boolean(work.open_access?.is_oa),
        abstractSnippet: reconstructAbstract(work.abstract_inverted_index),
      };
    });

    return {
      papers,
      totalCount: data.meta?.count ?? papers.length,
      page,
      perPage,
      query,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : "Failed to retrieve literature from OpenAlex";
    throw new Error(message);
  }
}

