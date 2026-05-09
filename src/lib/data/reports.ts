import type { ReportSummary } from "@/lib/types";

export const reportPreview: ReportSummary = {
  title: "Competence Analytics Report",
  scenarioName: "Workplace Safety Simulation",
  learnerCount: 5,
  classSummary:
    "Observation skills are strong while justification and structured reflection remain development areas across the cohort.",
  atRiskLearners: ["B221"],
  misconceptions: [
    "Treating hazard recognition as equivalent to risk control",
    "Selecting actions without causal justification",
  ],
  recommendedActions: [
    "Insert a short rationale prompt after each decision",
    "Pair reflections with worked examples comparing two actions",
  ],
};
