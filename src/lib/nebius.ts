import { HypothesisPair, MethodologyPhase, ResearchAnalysis, ResearchIdeaInput } from "@/types/research";

export class NebiusApiError extends Error {
  statusCode: number;
  provider: string;

  constructor(message: string, statusCode = 500, provider = "Nebius Token Factory") {
    super(message);
    this.name = "NebiusApiError";
    this.statusCode = statusCode;
    this.provider = provider;
  }
}

export function getResolvedNebiusConfig(overrideKey?: string, overrideModel?: string) {
  const apiKey = overrideKey?.trim() || process.env.NEBIUS_API_KEY?.trim() || "";
  const model =
    overrideModel?.trim() ||
    process.env.NEBIUS_MODEL?.trim() ||
    "nvidia/nemotron-3-super-120b-a12b";

  return { apiKey, model };
}

/**
 * Validates the raw JSON output from the model to guarantee structure and prevent runtime crashes.
 */
function validateAndNormalizeAnalysis(
  raw: Record<string, unknown>,
  input: ResearchIdeaInput,
  modelName: string
): Omit<ResearchAnalysis, "id" | "createdAt" | "verifiedLiterature"> {
  const executiveSummary =
    typeof raw.executiveSummary === "string" && raw.executiveSummary.trim().length > 20
      ? raw.executiveSummary.trim()
      : `Comprehensive validation report for research on "${input.topic}".`;

  const problemStatement =
    typeof raw.problemStatement === "string" && raw.problemStatement.trim().length > 20
      ? raw.problemStatement.trim()
      : input.topic;

  const researchQuestions = Array.isArray(raw.researchQuestions)
    ? raw.researchQuestions.filter((q): q is string => typeof q === "string" && q.trim().length > 0)
    : [input.researchQuestion || "What are the primary theoretical and empirical limits of the proposed approach?"];

  const rawHypotheses = Array.isArray(raw.hypotheses) ? raw.hypotheses : [];
  const hypotheses: HypothesisPair[] = rawHypotheses.map((h: unknown, idx: number) => {
    const item = typeof h === "object" && h !== null ? (h as Record<string, unknown>) : {};
    return {
      id: typeof item.id === "string" ? item.id : `h${idx + 1}`,
      h0: typeof item.h0 === "string" ? item.h0 : "Null hypothesis: No statistically significant effect.",
      h1: typeof item.h1 === "string" ? item.h1 : "Alternative hypothesis: Statistically significant improvement.",
      rationale: typeof item.rationale === "string" ? item.rationale : "Derived from theoretical model assumptions.",
    };
  });

  const rawNovelty = typeof raw.potentialNoveltyAndGap === "object" && raw.potentialNoveltyAndGap !== null
    ? (raw.potentialNoveltyAndGap as Record<string, unknown>)
    : {};

  const noveltyAssessmentValues: ("Incremental" | "Moderate" | "Substantial" | "High")[] = [
    "Incremental",
    "Moderate",
    "Substantial",
    "High",
  ];
  const noveltyAssessment = noveltyAssessmentValues.includes(rawNovelty.noveltyAssessment as "Incremental" | "Moderate" | "Substantial" | "High")
    ? (rawNovelty.noveltyAssessment as "Incremental" | "Moderate" | "Substantial" | "High")
    : "Moderate";

  const potentialNoveltyAndGap = {
    gapDescription:
      typeof rawNovelty.gapDescription === "string" && rawNovelty.gapDescription.trim().length > 10
        ? rawNovelty.gapDescription.trim()
        : "Identifies underexplored intersections in existing literature requiring experimental validation.",
    noveltyAssessment,
    differentiationFromPriorWork:
      typeof rawNovelty.differentiationFromPriorWork === "string"
        ? rawNovelty.differentiationFromPriorWork.trim()
        : "Distinguishes from prior benchmarks via targeted architectural or experimental modifications.",
    preliminaryNotice:
      "Preliminary AI Gap Hypothesis — This assessment is generated through conceptual analysis and must be confirmed against a formal systematic literature review before thesis defense or grant submission.",
  };

  const rawMethodology = typeof raw.suggestedMethodology === "object" && raw.suggestedMethodology !== null
    ? (raw.suggestedMethodology as Record<string, unknown>)
    : {};

  const rawPhases = Array.isArray(rawMethodology.phases) ? rawMethodology.phases : [];
  const phases: MethodologyPhase[] = rawPhases.map((p: unknown, idx: number) => {
    const pObj = typeof p === "object" && p !== null ? (p as Record<string, unknown>) : {};
    return {
      phaseNumber: typeof pObj.phaseNumber === "number" ? pObj.phaseNumber : idx + 1,
      title: typeof pObj.title === "string" ? pObj.title : `Phase ${idx + 1}`,
      durationWeeks: typeof pObj.durationWeeks === "string" ? pObj.durationWeeks : `Weeks ${idx * 4 + 1}–${(idx + 1) * 4}`,
      activities: Array.isArray(pObj.activities)
        ? pObj.activities.filter((a): a is string => typeof a === "string")
        : ["Execute primary experiments and baseline comparisons."],
      deliverables: Array.isArray(pObj.deliverables)
        ? pObj.deliverables.filter((d): d is string => typeof d === "string")
        : ["Interim report and code artifacts."],
    };
  });

  const suggestedMethodology = {
    framework:
      typeof rawMethodology.framework === "string"
        ? rawMethodology.framework
        : "Iterative empirical design with rigorous ablation testing.",
    phases: phases.length > 0 ? phases : [
      {
        phaseNumber: 1,
        title: "Literature Review and Baselines",
        durationWeeks: "Weeks 1–4",
        activities: ["Setup data pipelines", "Reproduce existing benchmarks"],
        deliverables: ["Reproducibility report"],
      },
      {
        phaseNumber: 2,
        title: "Methodological Execution",
        durationWeeks: "Weeks 5–10",
        activities: ["Implement core hypothesis architecture", "Run ablation studies"],
        deliverables: ["Experimental results table"],
      },
    ],
    baselineMethods: Array.isArray(rawMethodology.baselineMethods)
      ? rawMethodology.baselineMethods.filter((b): b is string => typeof b === "string")
      : ["Current published baseline standard", "Ablated variant"],
  };

  const rawDataset = typeof raw.datasetRequirements === "object" && raw.datasetRequirements !== null
    ? (raw.datasetRequirements as Record<string, unknown>)
    : {};

  const datasetRequirements = {
    requiredDataTypes: Array.isArray(rawDataset.requiredDataTypes)
      ? rawDataset.requiredDataTypes.filter((d): d is string => typeof d === "string")
      : ["Structured benchmark data", "Annotated ground truth"],
    recommendedSources: Array.isArray(rawDataset.recommendedSources)
      ? rawDataset.recommendedSources.filter((s): s is string => typeof s === "string")
      : ["Open-access academic repositories", "Public domain archives"],
    sampleSizeConsiderations:
      typeof rawDataset.sampleSizeConsiderations === "string"
        ? rawDataset.sampleSizeConsiderations
        : "Statistical power analysis should precede full-scale data acquisition.",
  };

  const rawEval = typeof raw.evaluationMetrics === "object" && raw.evaluationMetrics !== null
    ? (raw.evaluationMetrics as Record<string, unknown>)
    : {};

  const evaluationMetrics = {
    quantitativeMetrics: Array.isArray(rawEval.quantitativeMetrics)
      ? rawEval.quantitativeMetrics.filter((m): m is string => typeof m === "string")
      : ["Primary performance metric (e.g. F1, RMSE, Accuracy)", "Statistical significance (p-value)"],
    qualitativeCriteria: Array.isArray(rawEval.qualitativeCriteria)
      ? rawEval.qualitativeCriteria.filter((c): c is string => typeof c === "string")
      : ["Interpretability and error analysis", "Generalizability across subdomains"],
    benchmarkDatasets: Array.isArray(rawEval.benchmarkDatasets)
      ? rawEval.benchmarkDatasets.filter((b): b is string => typeof b === "string")
      : ["Standard domain benchmark 1", "Standard domain benchmark 2"],
  };

  const rawLimits = typeof raw.limitationsAndRisks === "object" && raw.limitationsAndRisks !== null
    ? (raw.limitationsAndRisks as Record<string, unknown>)
    : {};

  const limitationsAndRisks = {
    feasibilityRisks: Array.isArray(rawLimits.feasibilityRisks)
      ? rawLimits.feasibilityRisks.filter((r): r is string => typeof r === "string")
      : ["Compute or hardware availability", "Dataset access constraints"],
    methodologicalRisks: Array.isArray(rawLimits.methodologicalRisks)
      ? rawLimits.methodologicalRisks.filter((m): m is string => typeof m === "string")
      : ["Potential confounding variables", "Generalization bounds under distribution shift"],
    ethicalConsiderations: Array.isArray(rawLimits.ethicalConsiderations)
      ? rawLimits.ethicalConsiderations.filter((e): e is string => typeof e === "string")
      : ["Data privacy and consent protocols", "Transparent disclosure of computational carbon impact"],
  };

  // Generate an academic title if model didn't provide one
  const title =
    typeof raw.title === "string" && raw.title.trim().length > 10
      ? raw.title.trim()
      : input.topic.length > 80
      ? `${input.topic.slice(0, 80)}...`
      : input.topic;

  return {
    title,
    topic: input.topic,
    researchQuestion: input.researchQuestion,
    academicField: input.academicField || "Interdisciplinary Research",
    academicLevel: input.academicLevel,
    modelUsed: modelName,
    executiveSummary,
    problemStatement,
    researchQuestions,
    hypotheses,
    potentialNoveltyAndGap,
    suggestedMethodology,
    datasetRequirements,
    evaluationMetrics,
    limitationsAndRisks,
  };
}

/**
 * Executes structured academic idea evaluation via Nebius Token Factory Nemotron models.
 */
export async function analyzeResearchIdeaWithNemotron(
  input: ResearchIdeaInput,
  options?: { apiKey?: string; model?: string }
): Promise<Omit<ResearchAnalysis, "id" | "createdAt" | "verifiedLiterature">> {
  const { apiKey, model } = getResolvedNebiusConfig(options?.apiKey, options?.model);

  if (!apiKey) {
    throw new NebiusApiError(
      "NEBIUS_API_KEY is not configured on the server. Please provide an API key in .env.local or in application Settings.",
      401
    );
  }

  // System prompt tailored for rigorous academic validation according to level
  const systemPrompt = `You are an elite academic peer-review committee chair and research methodology director.
Your role is to rigorously deconstruct, critique, and provide a structured research design blueprint for a proposed academic research idea.
The target academic level is: ${input.academicLevel}.
Discipline: ${input.academicField || "General Scientific Domain"}.

Requirements:
- Emphasize methodological rigor, falsifiability, and clear distinction between hypothesis and established knowledge.
- The novelty gap MUST be explicitly noted as a preliminary hypothesis subject to verification against literature.
- DO NOT hallucinate paper citations in your text; return ONLY the structured methodological and design guidance.
- You MUST respond with ONLY a valid, parseable JSON object matching this schema without any preamble or conversational filler:

{
  "title": "A precise, publication-grade academic title for this project",
  "executiveSummary": "2-3 paragraphs synthesizing the core thesis, scientific value, and viability at the ${input.academicLevel} level.",
  "problemStatement": "Rigorous definition of the scientific problem, why current paradigms fail, and the cost of inaction.",
  "researchQuestions": [
    "Specific, answerable, and falsifiable question 1",
    "Specific, answerable, and falsifiable question 2",
    "Specific, answerable, and falsifiable question 3"
  ],
  "hypotheses": [
    {
      "id": "h1",
      "h0": "Formal null hypothesis stating no effect or no difference",
      "h1": "Directional alternative hypothesis stating expected relationship",
      "rationale": "Theoretical grounding justifying the expected effect"
    }
  ],
  "potentialNoveltyAndGap": {
    "gapDescription": "Explicit synthesis of the theoretical or experimental gap in current knowledge",
    "noveltyAssessment": "Incremental" | "Moderate" | "Substantial" | "High",
    "differentiationFromPriorWork": "Direct comparison with current leading baselines"
  },
  "suggestedMethodology": {
    "framework": "High-level theoretical or experimental paradigm",
    "phases": [
      {
        "phaseNumber": 1,
        "title": "Phase title",
        "durationWeeks": "Weeks 1–4",
        "activities": ["Activity 1", "Activity 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      }
    ],
    "baselineMethods": ["Baseline 1", "Baseline 2"]
  },
  "datasetRequirements": {
    "requiredDataTypes": ["Data type 1", "Data type 2"],
    "recommendedSources": ["Public repository or source 1", "Source 2"],
    "sampleSizeConsiderations": "Power analysis guidance and sample volume requirements"
  },
  "evaluationMetrics": {
    "quantitativeMetrics": ["Metric 1", "Metric 2"],
    "qualitativeCriteria": ["Criterion 1", "Criterion 2"],
    "benchmarkDatasets": ["Benchmark 1", "Benchmark 2"]
  },
  "limitationsAndRisks": {
    "feasibilityRisks": ["Risk 1", "Risk 2"],
    "methodologicalRisks": ["Risk 1", "Risk 2"],
    "ethicalConsiderations": ["Ethical note 1", "Ethical note 2"]
  }
}`;

  const userPrompt = `RESEARCH PROPOSAL DETAILS:
Topic / Problem Statement: ${input.topic}
${input.researchQuestion ? `Initial Research Question: ${input.researchQuestion}` : ""}
${input.academicField ? `Discipline: ${input.academicField}` : ""}
Target Academic Level: ${input.academicLevel}

Generate the comprehensive research validation blueprint in pure JSON format now.`;

  // Nebius Token Factory endpoint
  const endpoint = "https://api.tokenfactory.nebius.com/v1/chat/completions";

  const controller = new AbortController();
  const timeoutMs = 45000; // 45 seconds timeout
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 3500,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new NebiusApiError(
        `Nebius Token Factory request timed out after ${timeoutMs / 1000} seconds. The model is currently experiencing high load.`,
        504
      );
    }
    throw new NebiusApiError(
      `Failed to connect to Nebius Token Factory endpoint: ${err instanceof Error ? err.message : String(err)}`,
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let errorDetails = "";
    try {
      const errJson = await response.json();
      errorDetails = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetails = await response.text();
    }

    if (response.status === 401 || response.status === 403) {
      throw new NebiusApiError(
        `Nebius Token Factory authentication failed: ${errorDetails || "Invalid or unauthorized API key."}`,
        response.status
      );
    }
    if (response.status === 429) {
      throw new NebiusApiError(
        `Nebius Token Factory rate limit exceeded: ${errorDetails || "Too many requests. Please try again shortly."}`,
        429
      );
    }
    throw new NebiusApiError(
      `Nebius Token Factory error (${response.status}): ${errorDetails || response.statusText}`,
      response.status
    );
  }

  const responseJson = await response.json();
  const content = responseJson.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new NebiusApiError(
      "Nebius Token Factory returned an empty or malformed completion content.",
      502
    );
  }

  // Parse JSON from content (handling optional markdown code blocks)
  let parsedJson: Record<string, unknown>;
  try {
    const cleaned = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    parsedJson = JSON.parse(cleaned);
  } catch (parseErr) {
    // Attempt greedy brace extraction
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        parsedJson = JSON.parse(content.substring(firstBrace, lastBrace + 1));
      } catch {
        throw new NebiusApiError(
          `Unable to parse structured JSON from Nemotron model output: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`,
          502
        );
      }
    } else {
      throw new NebiusApiError(
        "Nemotron model response did not contain a valid JSON object structure.",
        502
      );
    }
  }

  return validateAndNormalizeAnalysis(parsedJson, input, model);
}

/**
 * Quick verification method to test Nebius Token Factory connection.
 */
export async function testNebiusConnection(apiKey?: string, model?: string): Promise<{ success: boolean; model: string; message: string }> {
  const { apiKey: key, model: m } = getResolvedNebiusConfig(apiKey, model);
  if (!key) {
    return {
      success: false,
      model: m,
      message: "No API key configured in environment or settings.",
    };
  }

  const endpoint = "https://api.tokenfactory.nebius.com/v1/chat/completions";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: m,
        messages: [{ role: "user", content: "Ping: Respond with single word 'READY'." }],
        max_tokens: 10,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return {
        success: true,
        model: m,
        message: "Connected successfully to Nebius Token Factory.",
      };
    } else {
      const err = await res.text();
      return {
        success: false,
        model: m,
        message: `HTTP ${res.status}: ${err.slice(0, 150)}`,
      };
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    return {
      success: false,
      model: m,
      message: err instanceof Error ? err.message : "Connection failed",
    };
  }
}
