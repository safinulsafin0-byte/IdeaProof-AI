import {
  AIProviderError,
  analyzeResearchIdea,
  testAIConnection,
  getResolvedAIConfig,
} from "./ai-provider";

// Re-exports for backwards compatibility and easy swapping with Nebius Token Factory
export {
  AIProviderError as NebiusApiError,
  analyzeResearchIdea as analyzeResearchIdeaWithNemotron,
  testAIConnection as testNebiusConnection,
  getResolvedAIConfig as getResolvedNebiusConfig,
};
