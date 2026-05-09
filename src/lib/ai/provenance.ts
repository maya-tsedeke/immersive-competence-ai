import type { DataProvenanceKind } from "@/lib/types";

export type ProvenanceContext =
  | "kpi_scores"
  | "kpi_risk"
  | "kpi_reflection"
  | "kpi_engagement"
  | "learner_row"
  | "chart"
  | "ai_result";

const LABELS: Record<DataProvenanceKind, string> = {
  ml_pipeline: "Generated from ML pipeline",
  mock_fallback: "Mock fallback",
  learner_demo: "Learner demo state",
  heuristic_label: "Heuristic dialogue model",
  teacher_reviewed: "Teacher-reviewed",
};

export function provenanceLabel(kind: DataProvenanceKind): string {
  return LABELS[kind];
}

export function getDataProvenance(
  ctx: ProvenanceContext,
  opts: { usingGeneratedJson: boolean; hasLearnerDemo?: boolean; isHeuristic?: boolean },
): DataProvenanceKind {
  if (opts.hasLearnerDemo && (ctx === "learner_row" || ctx === "ai_result")) {
    return "learner_demo";
  }
  if (opts.isHeuristic || ctx === "kpi_reflection") {
    return opts.usingGeneratedJson ? "heuristic_label" : "mock_fallback";
  }
  if (opts.usingGeneratedJson) return "ml_pipeline";
  return "mock_fallback";
}
