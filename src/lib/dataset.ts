/**
 * Data access: generated ML JSON under src/lib/generated with mock fallbacks.
 * Implementation lives in ./data/loadGenerated.ts
 */

export {
  computeDynamicKpi,
  getAiInsights,
  getDialogueInsightForLearner,
  getDialogueInsights,
  getGeneratedMeta,
  getInteractionLogForLearner,
  getInteractionLogs,
  getLearnerById,
  getLearnerRiskPredictions,
  getLearners,
  getPredictionCohortCounts,
  getReportSummary,
  getRiskPredictionForLearner,
  getRubricByLearner,
  getRubricForLearnerGenerated,
  getScenarioAnalytics,
  statusFromRiskScore,
  usingGeneratedData,
  /** @deprecated use usingGeneratedData */
  usingGeneratedData as isUsingGeneratedData,
} from "@/lib/data/loadGenerated";

export type { ScenarioAnalyticsBundle } from "@/lib/types";
