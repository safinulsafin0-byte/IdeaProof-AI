import { HypothesisPair, MethodologyPhase, ResearchAnalysis, ResearchIdeaInput } from "@/types/research";

export class AIProviderError extends Error {
  statusCode: number;
  provider: string;

  constructor(message: string, statusCode = 500, provider = "OpenRouter") {
    super(message);
    this.name = "AIProviderError";
    this.statusCode = statusCode;
    this.provider = provider;
  }
}

export interface AIProviderConfig {
  providerName: "OpenRouter" | "Nebius Token Factory" | "OpenAI-Compatible Provider";
  baseUrl: string;
  apiKey: string;
  model: string;
}

/**
 * Resolves AI provider configuration from environment variables or optional custom session override.
 * Put behind a small abstraction so the base URL, key, and model can be swapped by env variables without changing route code.
 */
export function getResolvedAIConfig(overrideKey?: string, overrideModel?: string): AIProviderConfig {
  const customBaseUrl = process.env.AI_BASE_URL?.trim() || process.env.OPENROUTER_BASE_URL?.trim();
  const openRouterKey =
    overrideKey?.trim() ||
    process.env.OPENROUTER_API_KEY?.trim() ||
    process.env.AI_API_KEY?.trim() ||
    "";
  const nebiusKey = process.env.NEBIUS_API_KEY?.trim() || "";

  // 1. If custom base URL is specified in env
  if (customBaseUrl) {
    const apiKey = openRouterKey || nebiusKey;
    const model =
      overrideModel?.trim() ||
      process.env.OPENROUTER_MODEL?.trim() ||
      process.env.AI_MODEL?.trim() ||
      process.env.NEBIUS_MODEL?.trim() ||
      "nvidia/nemotron-3-super-120b-a12b";

    const providerName = customBaseUrl.includes("openrouter")
      ? "OpenRouter"
      : customBaseUrl.includes("nebius")
      ? "Nebius Token Factory"
      : "OpenAI-Compatible Provider";

    return {
      providerName,
      baseUrl: customBaseUrl,
      apiKey,
      model,
    };
  }

  // 2. Default: OpenRouter (or user custom session key)
  if (openRouterKey || !nebiusKey) {
    const model =
      overrideModel?.trim() ||
      process.env.OPENROUTER_MODEL?.trim() ||
      process.env.AI_MODEL?.trim() ||
      "nvidia/nemotron-3-super-120b-a12b";

    return {
      providerName: "OpenRouter",
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: openRouterKey,
      model,
    };
  }

  // 3. Fallback to Nebius Token Factory if NEBIUS_API_KEY is configured
  const model =
    overrideModel?.trim() ||
    process.env.NEBIUS_MODEL?.trim() ||
    process.env.AI_MODEL?.trim() ||
    "nvidia/nemotron-3-super-120b-a12b";

  return {
    providerName: "Nebius Token Factory",
    baseUrl: "https://api.tokenfactory.nebius.com/v1",
    apiKey: nebiusKey,
    model,
  };
}

/**
 * Validates and normalizes the raw JSON output from the model into the strict ResearchAnalysis blueprint schema.
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

  const rawNovelty =
    typeof raw.potentialNoveltyAndGap === "object" && raw.potentialNoveltyAndGap !== null
      ? (raw.potentialNoveltyAndGap as Record<string, unknown>)
      : {};

  const noveltyAssessmentValues: ("Incremental" | "Moderate" | "Substantial" | "High")[] = [
    "Incremental",
    "Moderate",
    "Substantial",
    "High",
  ];
  const noveltyAssessment = noveltyAssessmentValues.includes(
    rawNovelty.noveltyAssessment as "Incremental" | "Moderate" | "Substantial" | "High"
  )
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

  const rawMethodology =
    typeof raw.suggestedMethodology === "object" && raw.suggestedMethodology !== null
      ? (raw.suggestedMethodology as Record<string, unknown>)
      : {};

  const rawPhases = Array.isArray(rawMethodology.phases) ? rawMethodology.phases : [];
  const phases: MethodologyPhase[] = rawPhases.map((p: unknown, idx: number) => {
    const pObj = typeof p === "object" && p !== null ? (p as Record<string, unknown>) : {};
    return {
      phaseNumber: typeof pObj.phaseNumber === "number" ? pObj.phaseNumber : idx + 1,
      title: typeof pObj.title === "string" ? pObj.title : `Phase ${idx + 1}`,
      durationWeeks:
        typeof pObj.durationWeeks === "string" ? pObj.durationWeeks : `Weeks ${idx * 4 + 1}–${(idx + 1) * 4}`,
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
    phases:
      phases.length > 0
        ? phases
        : [
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

  const rawDataset =
    typeof raw.datasetRequirements === "object" && raw.datasetRequirements !== null
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

  const rawEval =
    typeof raw.evaluationMetrics === "object" && raw.evaluationMetrics !== null
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

  const rawLimits =
    typeof raw.limitationsAndRisks === "object" && raw.limitationsAndRisks !== null
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
    modelUsed: `${modelName} (${getResolvedAIConfig().providerName})`,
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
 * Strips markdown code fences (```json or ```) and any extraneous text outside
 * the outermost JSON object braces { ... }.
 */
export function extractAndCleanJson(rawContent: string): string {
  if (!rawContent || typeof rawContent !== "string") return "";
  let text = rawContent.trim();

  // Strip leading and trailing markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, "");
  text = text.replace(/\s*```$/i, "");
  text = text.trim();

  // Extract from outermost '{' to last '}'
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    return text.substring(firstBrace, lastBrace + 1).trim();
  }

  return text;
}

interface ProviderCompletionResult {
  content: string;
  finishReason: string | null;
}

/**
 * Dispatches a chat completion request to the provider with optional JSON object format
 * and graceful fallback if the provider rejects the response_format parameter.
 */
async function requestChatCompletion(
  config: AIProviderConfig,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number,
  timeoutMs: number,
  tryJsonFormat: boolean
): Promise<ProviderCompletionResult> {
  const endpoint = `${config.baseUrl}/chat/completions`;

  const executeFetch = async (useJsonFormat: boolean): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const payload: Record<string, unknown> = {
      model: config.model,
      messages,
      temperature: 0.2,
      max_tokens: maxTokens,
    };

    if (useJsonFormat) {
      payload.response_format = { type: "json_object" };
    }

    try {
      return await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
          Accept: "application/json",
          "HTTP-Referer": "https://ideaproof.ai",
          "X-Title": "IdeaProof AI",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let response: Response;
  try {
    response = await executeFetch(tryJsonFormat);

    // Fallback gracefully if provider rejects response_format
    if (!response.ok && tryJsonFormat && response.status === 400) {
      let errText = "";
      try {
        errText = await response.clone().text();
      } catch {
        errText = "";
      }

      const lowerErr = errText.toLowerCase();
      if (
        lowerErr.includes("response_format") ||
        lowerErr.includes("json_object") ||
        lowerErr.includes("unsupported") ||
        lowerErr.includes("schema")
      ) {
        console.warn(
          `[AI Provider] ${config.providerName} rejected response_format: { type: "json_object" }. Retrying standard request...`
        );
        response = await executeFetch(false);
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new AIProviderError(
        `${config.providerName} request timed out after ${timeoutMs / 1000} seconds. Please retry shortly.`,
        504,
        config.providerName
      );
    }
    throw new AIProviderError(
      `Failed to connect to ${config.providerName} (${endpoint}): ${
        err instanceof Error ? err.message : String(err)
      }`,
      502,
      config.providerName
    );
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
      throw new AIProviderError(
        `${config.providerName} authentication failed: ${errorDetails || "Invalid or unauthorized API key."}`,
        response.status,
        config.providerName
      );
    }
    if (response.status === 429) {
      throw new AIProviderError(
        `${config.providerName} rate limit exceeded: ${errorDetails || "Too many requests. Please pause and retry."}`,
        429,
        config.providerName
      );
    }
    throw new AIProviderError(
      `${config.providerName} error (HTTP ${response.status}): ${errorDetails || response.statusText}`,
      response.status,
      config.providerName
    );
  }

  const responseJson = await response.json();
  const choice = responseJson.choices?.[0];
  const rawMessage = choice?.message;
  const content = rawMessage?.content || rawMessage?.text || "";
  const finishReason = (choice?.finish_reason as string) || null;

  return {
    content,
    finishReason,
  };
}

/**
 * Executes structured research analysis via the active AI provider (OpenRouter by default, easily swappable with Nebius).
 */
export async function analyzeResearchIdea(
  input: ResearchIdeaInput,
  options?: { apiKey?: string; model?: string }
): Promise<Omit<ResearchAnalysis, "id" | "createdAt" | "verifiedLiterature">> {
  const config = getResolvedAIConfig(options?.apiKey, options?.model);

  if (!config.apiKey) {
    throw new AIProviderError(
      `${config.providerName} API key is not configured. Please set ${
        config.providerName === "OpenRouter" ? "OPENROUTER_API_KEY" : "NEBIUS_API_KEY"
      } in server environment variables or provide a key in Settings.`,
      401,
      config.providerName
    );
  }

  const systemPrompt = `You are an elite academic peer-review committee chair and research methodology director.
Your role is to rigorously deconstruct, critique, and provide a structured research design blueprint for a proposed academic research idea.
The target academic level is: ${input.academicLevel}.
Discipline: ${input.academicField || "General Scientific Domain"}.

STRICT CONCISENESS & SCHEMA RULES:
- Output ONLY a valid, parseable JSON object matching the exact schema below.
- Keep output concise to prevent truncation:
  * Each prose field (executiveSummary, problemStatement, gapDescription, differentiationFromPriorWork, framework, sampleSizeConsiderations) must be AT MOST 2-3 concise sentences.
  * All lists/arrays must contain AT MOST 3-4 high-value items.
  * The "hypotheses" array must contain AT MOST 2 hypothesis pairs.
  * The "phases" array must contain AT MOST 3 phases, with at most 2 activities and 2 deliverables each.
- Ensure every string is properly closed and the entire JSON object terminates with valid closing braces.
- DO NOT fabricate citations, DOIs, or papers in your text.
- Do NOT include any introductory or concluding text, explanations, or conversational markdown outside the JSON.

SCHEMA:
{
  "title": "A publication-grade academic title (1 sentence)",
  "executiveSummary": "Concise summary synthesizing core thesis, scientific value, and viability (at most 2-3 sentences).",
  "problemStatement": "Rigorous definition of why current paradigms fail and the research problem (at most 2-3 sentences).",
  "researchQuestions": [
    "Specific, answerable question 1",
    "Specific, answerable question 2",
    "Specific, answerable question 3"
  ],
  "hypotheses": [
    {
      "id": "h1",
      "h0": "Formal null hypothesis (1 sentence)",
      "h1": "Directional alternative hypothesis (1 sentence)",
      "rationale": "Theoretical grounding (1-2 sentences)"
    }
  ],
  "potentialNoveltyAndGap": {
    "gapDescription": "Explicit synthesis of the theoretical or experimental gap in current knowledge (at most 2-3 sentences)",
    "noveltyAssessment": "Incremental" | "Moderate" | "Substantial" | "High",
    "differentiationFromPriorWork": "Direct comparison with current leading baselines (at most 2-3 sentences)"
  },
  "suggestedMethodology": {
    "framework": "High-level theoretical or experimental paradigm (at most 2-3 sentences)",
    "phases": [
      {
        "phaseNumber": 1,
        "title": "Phase title",
        "durationWeeks": "Weeks 1–4",
        "activities": ["Activity 1", "Activity 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      }
    ],
    "baselineMethods": ["Baseline method 1", "Baseline method 2", "Baseline method 3"]
  },
  "datasetRequirements": {
    "requiredDataTypes": ["Data type 1", "Data type 2", "Data type 3"],
    "recommendedSources": ["Public repository or source 1", "Source 2", "Source 3"],
    "sampleSizeConsiderations": "Power analysis guidance and sample volume requirements (at most 2 sentences)"
  },
  "evaluationMetrics": {
    "quantitativeMetrics": ["Metric 1", "Metric 2", "Metric 3"],
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

Generate the comprehensive research validation blueprint in pure JSON format now. Remember: concise fields (2-3 sentences maximum) and lists of at most 3-4 items.`;

  const perAttemptTimeoutMs = 27000; // 27 seconds per attempt
  let parsedJson: Record<string, unknown> | null = null;
  let attempt1Truncated = false;
  let attempt1ParseError = "";

  // ATTEMPT 1: Primary structured generation (max_tokens: 7500)
  try {
    const result1 = await requestChatCompletion(
      config,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      7500,
      perAttemptTimeoutMs,
      true
    );

    if (result1.finishReason === "length") {
      attempt1Truncated = true;
    } else if (!result1.content.trim()) {
      attempt1ParseError = "Empty completion content";
    } else {
      const cleaned = extractAndCleanJson(result1.content);
      try {
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        attempt1ParseError = parseErr instanceof Error ? parseErr.message : "JSON syntax error";
      }
    }
  } catch (err: unknown) {
    if (err instanceof AIProviderError && (err.statusCode === 401 || err.statusCode === 403 || err.statusCode === 429)) {
      throw err;
    }
    attempt1ParseError = err instanceof Error ? err.message : String(err);
  }

  // ATTEMPT 2: Automatic retry if truncated or JSON parse failed
  if (!parsedJson) {
    console.warn(
      `[AI Provider] Attempt 1 failed (${attempt1Truncated ? "Truncated output" : attempt1ParseError}). Retrying with stricter brevity instruction...`
    );

    const retrySystemPrompt = `${systemPrompt}

CRITICAL RETRY INSTRUCTION:
The previous attempt failed due to output truncation or incomplete JSON syntax. You MUST keep your output ultra-concise:
- Each prose field must be AT MOST 1-2 brief sentences.
- Lists/arrays must contain AT MOST 2-3 items.
- Ensure all quotes and brackets close properly to output 100% valid, complete JSON.`;

    try {
      const result2 = await requestChatCompletion(
        config,
        [
          { role: "system", content: retrySystemPrompt },
          { role: "user", content: userPrompt },
        ],
        8000,
        perAttemptTimeoutMs,
        true
      );

      // Check finish_reason
      if (result2.finishReason === "length") {
        throw new AIProviderError(
          `The ${config.providerName} model response was truncated due to output length limits. Please click "Retry Analysis" or try a more specific topic.`,
          502,
          config.providerName
        );
      }

      if (!result2.content.trim()) {
        throw new AIProviderError(
          `${config.providerName} returned an empty completion. Please click "Retry Analysis".`,
          502,
          config.providerName
        );
      }

      const cleaned2 = extractAndCleanJson(result2.content);
      try {
        parsedJson = JSON.parse(cleaned2);
      } catch (parseErr: unknown) {
        throw new AIProviderError(
          `Unable to parse structured JSON from ${config.providerName} model output: ${
            parseErr instanceof Error ? parseErr.message : "Incomplete JSON"
          }. The model output was incomplete or malformed. Please click "Retry Analysis" to generate again.`,
          502,
          config.providerName
        );
      }
    } catch (retryErr: unknown) {
      if (retryErr instanceof AIProviderError) {
        throw retryErr;
      }
      throw new AIProviderError(
        `Analysis generation failed: ${retryErr instanceof Error ? retryErr.message : "Inference error"}. Please retry.`,
        502,
        config.providerName
      );
    }
  }

  if (!parsedJson) {
    throw new AIProviderError(
      `Failed to generate structured research analysis from ${config.providerName}. Please try again.`,
      502,
      config.providerName
    );
  }

  return validateAndNormalizeAnalysis(parsedJson, input, config.model);
}

/**
 * Diagnostic test to verify active AI provider connectivity and authentication.
 */
export async function testAIConnection(
  apiKey?: string,
  model?: string
): Promise<{ success: boolean; provider: string; model: string; message: string }> {
  const config = getResolvedAIConfig(apiKey, model);

  if (!config.apiKey) {
    return {
      success: false,
      provider: config.providerName,
      model: config.model,
      message: `No ${config.providerName} API key configured in server environment or settings.`,
    };
  }

  const endpoint = `${config.baseUrl}/chat/completions`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
        "HTTP-Referer": "https://ideaproof.ai",
        "X-Title": "IdeaProof AI Test",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: "Ping: Respond with single word 'READY'." }],
        max_tokens: 15,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return {
        success: true,
        provider: config.providerName,
        model: config.model,
        message: `Successfully connected to ${config.providerName} (${config.model}).`,
      };
    } else {
      let errText = "";
      try {
        const errJson = await res.json();
        errText = errJson.error?.message || JSON.stringify(errJson);
      } catch {
        errText = await res.text();
      }
      return {
        success: false,
        provider: config.providerName,
        model: config.model,
        message: `HTTP ${res.status}: ${errText.slice(0, 160)}`,
      };
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    return {
      success: false,
      provider: config.providerName,
      model: config.model,
      message: err instanceof Error ? err.message : "Connection failed.",
    };
  }
}

