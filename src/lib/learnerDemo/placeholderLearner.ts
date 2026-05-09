import type { Learner } from "@/lib/types";

export function isDemoStaticLearnerId(id: string): boolean {
  return /^Demo-\d+$/i.test(id);
}

/** SSR placeholder before client merges localStorage demo rows. */
export function placeholderDemoLearner(id: string): Learner {
  return {
    id,
    score: 0,
    engagement: "Low",
    reflection: "Low",
    status: "Strong",
    displayStatus: "Strong",
    isLocalDemo: true,
    scenarioTitle: "Workplace Safety Simulation",
    demoProgressPct: 0,
    demoLearningStatusLabel: "not_started",
    demoLearningActivityStatus: "Not started",
    demoAiAnalysisLabel: "Not run",
    demoAiResultLabel: "—",
    demoTeacherDecisionLabel: "Not reviewed",
    demoActionRequired: "Start scenario",
  };
}
