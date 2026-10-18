export type AcademicLevel = "Undergraduate" | "Master's" | "PhD";

export interface ResearchIdeaInput {
  topic: string;
  researchQuestion?: string;
  academicField?: string;
  academicLevel: AcademicLevel;
}

export interface VerifiedPaper {
  id: string;
  title: string;
  authors: string[];
  publicationYear: number | null;
  doi: string | null;
  source: string | null; // Journal or conference name
  url: string | null;
  citedByCount: number;
  isOpenAccess: boolean;
  abstractSnippet?: string;
}

export interface HypothesisPair {
  id: string;
  h0: string; // Null hypothesis
  h1: string; // Alternative hypothesis
  rationale: string;
}

export interface MethodologyPhase {
  phaseNumber: number;
  title: string;
  durationWeeks: string;
  activities: string[];
  deliverables: string[];
}

export interface ResearchAnalysis {
  id: string;
  createdAt: string;
  title: string;
  topic: string;
  researchQuestion?: string;
  academicField: string;
  academicLevel: AcademicLevel;
  isDemo?: boolean;
  modelUsed?: string;

  executiveSummary: string;
  problemStatement: string;

  researchQuestions: string[];
  hypotheses: HypothesisPair[];

  potentialNoveltyAndGap: {
    gapDescription: string;
    noveltyAssessment: "Incremental" | "Moderate" | "Substantial" | "High";
    differentiationFromPriorWork: string;
    preliminaryNotice: string;
  };

  suggestedMethodology: {
    framework: string;
    phases: MethodologyPhase[];
    baselineMethods: string[];
  };

  datasetRequirements: {
    requiredDataTypes: string[];
    recommendedSources: string[];
    sampleSizeConsiderations: string;
  };

  evaluationMetrics: {
    quantitativeMetrics: string[];
    qualitativeCriteria: string[];
    benchmarkDatasets: string[];
  };

  limitationsAndRisks: {
    feasibilityRisks: string[];
    methodologicalRisks: string[];
    ethicalConsiderations: string[];
  };

  verifiedLiterature: VerifiedPaper[];
}

export interface LiteratureSearchFilters {
  query: string;
  fromYear?: number;
  toYear?: number;
  isOpenAccessOnly?: boolean;
  sortBy?: "relevance" | "cited_by_count:desc" | "publication_year:desc";
  page?: number;
  perPage?: number;
}

export interface LiteratureSearchResponse {
  papers: VerifiedPaper[];
  totalCount: number;
  page: number;
  perPage: number;
  query: string;
}

export interface ApiStatus {
  nebiusConfigured: boolean;
  nebiusModel: string;
  openAlexStatus: "connected" | "degraded" | "unavailable";
}

export interface UserPreferences {
  defaultLevel: AcademicLevel;
  primaryField: string;
  citationStyle: "APA" | "IEEE" | "Chicago" | "BibTeX";
  customNebiusApiKey?: string;
  selectedModel?: string;
}

