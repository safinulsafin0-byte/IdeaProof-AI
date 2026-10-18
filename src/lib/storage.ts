import { ResearchAnalysis, UserPreferences } from "@/types/research";
import { DEMO_PROJECTS } from "./demo-data";

const STORAGE_KEY = "ideaproof_projects_v1";
const PREFS_KEY = "ideaproof_preferences_v1";

export function getStoredProjects(): ResearchAnalysis[] {
  if (typeof window === "undefined") return DEMO_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with demo projects on first visit
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PROJECTS));
      return DEMO_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEMO_PROJECTS;
  } catch (err) {
    console.warn("Error reading stored projects:", err);
    return DEMO_PROJECTS;
  }
}

export function saveProject(project: ResearchAnalysis): ResearchAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getStoredProjects();
    const updated = [project, ...existing.filter((p) => p.id !== project.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error saving project:", err);
    return [];
  }
}

export function deleteProject(id: string): ResearchAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getStoredProjects();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error deleting project:", err);
    return [];
  }
}

export function getProjectById(id: string): ResearchAnalysis | null {
  const projects = getStoredProjects();
  return projects.find((p) => p.id === id) || null;
}

export function clearAllProjects(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function resetToDemoProjects(): ResearchAnalysis[] {
  if (typeof window === "undefined") return DEMO_PROJECTS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PROJECTS));
  return DEMO_PROJECTS;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultLevel: "Master's",
  primaryField: "Computer Science",
  citationStyle: "APA",
  selectedModel: "nvidia/nemotron-3-super-120b-a12b",
};

export function getUserPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Generates an academic Markdown report from the structured analysis.
 */
export function generateMarkdownReport(analysis: ResearchAnalysis): string {
  const dateFormatted = new Date(analysis.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `# ${analysis.title}

> **IdeaProof AI Research Validation Report**  
> **Academic Level:** ${analysis.academicLevel}  
> **Discipline:** ${analysis.academicField}  
> **Date Generated:** ${dateFormatted}  
> **Evaluation Engine:** ${analysis.modelUsed || "NVIDIA Nemotron"}  
> **Status:** ${analysis.isDemo ? "Demonstration Benchmark Dataset" : "Live Peer Review Analysis"}

---

## 1. Executive Summary
${analysis.executiveSummary}

---

## 2. Problem Statement
${analysis.problemStatement}

---

## 3. Research Questions & Hypotheses
${analysis.researchQuestions.map((q, idx) => `### Research Question ${idx + 1}\n${q}`).join("\n\n")}

### Formal Hypotheses
${analysis.hypotheses
  .map(
    (h, idx) => `#### Hypothesis Pair ${idx + 1} (${h.id})
- **H0 (Null Hypothesis):** ${h.h0}
- **H1 (Alternative Hypothesis):** ${h.h1}
- *Theoretical Rationale:* ${h.rationale}`
  )
  .join("\n\n")}

---

## 4. Potential Novelty & Research Gap
**Preliminary Gap Assessment:**
${analysis.potentialNoveltyAndGap.gapDescription}

- **Estimated Novelty Degree:** ${analysis.potentialNoveltyAndGap.noveltyAssessment}
- **Differentiation from Prior Work:** ${analysis.potentialNoveltyAndGap.differentiationFromPriorWork}

> **Methodological Disclaimer:**  
> *${analysis.potentialNoveltyAndGap.preliminaryNotice}*

---

## 5. Suggested Methodology & Execution Plan
**Overarching Framework:** ${analysis.suggestedMethodology.framework}

### Execution Phases
${analysis.suggestedMethodology.phases
  .map(
    (p) => `#### Phase ${p.phaseNumber}: ${p.title} (${p.durationWeeks})
**Key Activities:**
${p.activities.map((a) => `- ${a}`).join("\n")}

**Milestone Deliverables:**
${p.deliverables.map((d) => `- ${d}`).join("\n")}`
  )
  .join("\n\n")}

### Baseline Benchmarks for Comparison
${analysis.suggestedMethodology.baselineMethods.map((b) => `- ${b}`).join("\n")}

---

## 6. Dataset Requirements & Evaluation Metrics
### Data Requirements
- **Required Data Types:**
${analysis.datasetRequirements.requiredDataTypes.map((d) => `  - ${d}`).join("\n")}
- **Recommended Repositories / Sources:**
${analysis.datasetRequirements.recommendedSources.map((s) => `  - ${s}`).join("\n")}
- **Sample Size & Power Analysis:**
  ${analysis.datasetRequirements.sampleSizeConsiderations}

### Evaluation Metrics
- **Quantitative Metrics:** ${analysis.evaluationMetrics.quantitativeMetrics.join(", ")}
- **Qualitative Evaluation Criteria:** ${analysis.evaluationMetrics.qualitativeCriteria.join(", ")}
- **Benchmark Datasets:** ${analysis.evaluationMetrics.benchmarkDatasets.join(", ")}

---

## 7. Limitations & Risk Analysis
### Feasibility Risks
${analysis.limitationsAndRisks.feasibilityRisks.map((r) => `- ${r}`).join("\n")}

### Methodological & Confounding Risks
${analysis.limitationsAndRisks.methodologicalRisks.map((r) => `- ${r}`).join("\n")}

### Ethical Considerations
${analysis.limitationsAndRisks.ethicalConsiderations.map((e) => `- ${e}`).join("\n")}

---

## 8. Verified Related Literature (OpenAlex Verified Metadata)
*Note: The following publications were retrieved from real open-access academic indices. Citations and DOIs are verified.*

${
  analysis.verifiedLiterature.length > 0
    ? analysis.verifiedLiterature
        .map(
          (p, idx) => `[${idx + 1}] **${p.title}**  
   Authors: ${p.authors.join(", ")} (${p.publicationYear || "n.d."})  
   Venue: ${p.source || "Academic Venue"}  
   ${p.doi ? `DOI: [${p.doi}](${p.doi})` : `URL: [${p.url || p.id}](${p.url || p.id})`}  
   Citations in Index: ${p.citedByCount.toLocaleString()}  
   Open Access: ${p.isOpenAccess ? "Yes" : "Subscription/Restricted"}  
   ${p.abstractSnippet ? `*Summary Excerpt:* "${p.abstractSnippet}"` : ""}`
        )
        .join("\n\n")
    : "No related publications matched the search query parameters directly."
}

---
*Report generated via IdeaProof AI — Academic Idea Validation Platform.*
`;
}

/**
 * Downloads a string content as a file in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType = "text/markdown"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

