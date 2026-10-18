import { NextRequest, NextResponse } from "next/server";
import { analyzeResearchIdeaWithNemotron, NebiusApiError } from "@/lib/nebius";
import { searchOpenAlex } from "@/lib/openalex";
import { AcademicLevel, ResearchAnalysis, ResearchIdeaInput } from "@/types/research";

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

    // Check for optional custom API key passed in request header from client Settings
    const customApiKey = req.headers.get("x-nebius-api-key") || undefined;
    const customModel = req.headers.get("x-nebius-model") || undefined;

    // 2. Execute Structured Analysis via NVIDIA Nemotron
    const analysisBlueprint = await analyzeResearchIdeaWithNemotron(input, {
      apiKey: customApiKey,
      model: customModel,
    });

    // 3. Extract key terms and query OpenAlex for verified literature
    // Use academic field + core topic keywords
    let searchQuery = input.topic
      .replace(/[^\w\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["with", "from", "that", "this", "what", "which", "into"].includes(w.toLowerCase()))
      .slice(0, 6)
      .join(" ");

    if (input.academicField && !searchQuery.toLowerCase().includes(input.academicField.toLowerCase())) {
      searchQuery = `${input.academicField} ${searchQuery}`;
    }

    let verifiedLiterature: import("@/types/research").VerifiedPaper[] = [];
    try {
      const literatureResponse = await searchOpenAlex({
        query: searchQuery || input.topic.slice(0, 60),
        perPage: 6,
        sortBy: "cited_by_count:desc",
      });
      verifiedLiterature = literatureResponse.papers;
    } catch (litErr) {
      console.warn("OpenAlex retrieval warning:", litErr);
      // Fallback: We do not invent fake papers. Leave literature array empty or partial if service is down
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
    if (err instanceof NebiusApiError) {
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
