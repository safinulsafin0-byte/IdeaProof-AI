import { NextRequest, NextResponse } from "next/server";
import { analyzeResearchIdea, AIProviderError } from "@/lib/ai-provider";
import { searchOpenAlex } from "@/lib/openalex";
import { AcademicLevel, ResearchAnalysis, ResearchIdeaInput, VerifiedPaper } from "@/types/research";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, researchQuestion, academicField, academicLevel } = body;

    // 1. Strict Input Validation
    if (!topic || typeof topic !== "string" || topic.trim().length < 10) {
      return NextResponse.json(
        { error: "Research topic must be at least 10 characters in length." },
        { status: 400 }
      );
    }

    if (topic.length > 2500) {
      return NextResponse.json(
        { error: "Research topic must not exceed 2500 characters." },
        { status: 400 }
      );
    }

    const validLevels: AcademicLevel[] = ["Undergraduate", "Master's", "PhD"];
    const level: AcademicLevel = validLevels.includes(academicLevel) ? academicLevel : "Master's";

    const input: ResearchIdeaInput = {
      topic: topic.trim(),
      researchQuestion: typeof researchQuestion === "string" ? researchQuestion.trim() : undefined,
      academicField: typeof academicField === "string" ? academicField.trim() : undefined,
      academicLevel: level,
    };

    // Support optional custom session headers from client settings
    const customApiKey =
      req.headers.get("x-openrouter-api-key") ||
      req.headers.get("x-ai-api-key") ||
      req.headers.get("x-nebius-api-key") ||
      undefined;

    const customModel =
      req.headers.get("x-openrouter-model") ||
      req.headers.get("x-ai-model") ||
      req.headers.get("x-nebius-model") ||
      undefined;

    // 2. Execute Structured Analysis via active AI provider (OpenRouter / Nemotron)
    const analysisBlueprint = await analyzeResearchIdea(input, {
      apiKey: customApiKey,
      model: customModel,
    });

    // 3. Extract key terms and query OpenAlex for verified empirical literature
    let searchQuery = input.topic
      .replace(/[^\w\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["with", "from", "that", "this", "what", "which", "into"].includes(w.toLowerCase()))
      .slice(0, 6)
      .join(" ");

    if (input.academicField && !searchQuery.toLowerCase().includes(input.academicField.toLowerCase())) {
      searchQuery = `${input.academicField} ${searchQuery}`;
    }

    let verifiedLiterature: VerifiedPaper[] = [];
    try {
      const literatureResponse = await searchOpenAlex({
        query: searchQuery || input.topic.slice(0, 60),
        perPage: 6,
        sortBy: "cited_by_count:desc",
      });
      verifiedLiterature = literatureResponse.papers;
    } catch (litErr) {
      console.warn("OpenAlex retrieval warning:", litErr);
      // Strictly do not fabricate missing literature; leave list empty or partial
      verifiedLiterature = [];
    }

    // 4. Construct complete response
    const completeAnalysis: ResearchAnalysis = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...analysisBlueprint,
      isDemo: false,
      verifiedLiterature,
    };

    return NextResponse.json(completeAnalysis);
  } catch (err: unknown) {
    if (err instanceof AIProviderError) {
      return NextResponse.json(
        {
          error: err.message,
          statusCode: err.statusCode,
          provider: err.provider,
        },
        { status: err.statusCode }
      );
    }

    console.error("Unhandled error in /api/analyze:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unexpected server error occurred during idea analysis.",
      },
      { status: 500 }
    );
  }
}
