import type {
  AiAnalysisBundle,
  DialogueInsight,
  InteractionLog,
  Learner,
  LearnerRiskPrediction,
  LearnerStatus,
} from "@/lib/types";

export function mapReasoningDepthLabel(d: DialogueInsight | undefined, fallback: string): string {
  if (!d) return fallback;
  const v = String(d.reasoningDepth ?? "").toLowerCase();
  if (v.includes("good") || v.includes("deep")) return "Good";
  if (v.includes("develop")) return "Developing";
  return "Needs support";
}

export function mapReflectionQualityLabel(d: DialogueInsight | undefined, fallback: string): string {
  if (!d) return fallback;
  const v = String(d.reflectionQuality ?? "").toLowerCase();
  if (v.includes("high")) return "High";
  if (v.includes("low")) return "Low";
  return "Medium";
}

function riskToIndicator(learner: Learner, risk?: LearnerRiskPrediction | null): LearnerStatus {
  if (risk) {
    const s = risk.riskLevel?.toLowerCase() ?? "";
    if (s.includes("high") || risk.riskScore >= 0.65) return "At risk";
    if (s.includes("medium") || risk.riskScore >= 0.35) return "Needs feedback";
    return "Strong";
  }
  return learner.displayStatus ?? learner.status;
}

export function buildAiAnalysisBundle(input: {
  learner: Learner;
  dialogue?: DialogueInsight | null;
  risk?: LearnerRiskPrediction | null;
  log?: InteractionLog | null;
  demoJustification?: string;
  demoReflection?: string;
  demoMcLabel?: string;
  demoHotspotClicked?: string;
  demoTimeSpentSec?: number;
  demoEventCount?: number;
  usingGeneratedJson: boolean;
}): AiAnalysisBundle {
  const {
    learner,
    dialogue,
    risk,
    log,
    demoJustification,
    demoReflection,
    demoMcLabel,
    demoHotspotClicked,
    demoTimeSpentSec,
    demoEventCount,
    usingGeneratedJson,
  } = input;

  const riskIndicator = riskToIndicator(learner, risk);
  const reflectionQuality = mapReflectionQualityLabel(
    dialogue ?? undefined,
    learner.reflection === "High" ? "High" : learner.reflection === "Low" ? "Low" : "Medium",
  );
  const reasoningDepth = mapReasoningDepthLabel(dialogue ?? undefined, "Developing");

  const difficulty =
    dialogue?.misconception?.trim() ||
    "The learner identified the hazard, but the justification does not clearly explain why the chosen action reduces risk.";

  const suggested =
    dialogue?.teacherFeedbackSuggestion?.trim() ||
    risk?.teacherRecommendation?.trim() ||
    "Ask the learner to compare two possible safety actions and explain which one reduces risk more effectively.";

  const confidence =
    dialogue?.confidence != null
      ? Math.min(0.95, Math.max(0.35, dialogue.confidence))
      : risk != null
        ? Math.min(0.92, Math.max(0.4, 1 - (risk.riskScore ?? 0.5) * 0.6))
        : 0.55;

  const eventCount =
    demoEventCount != null ? demoEventCount : (log?.events?.length ?? 0);

  const evidenceLines: string[] = [];
  if (demoHotspotClicked)
    evidenceLines.push(`Hotspot clicked: ${demoHotspotClicked} (learner scenario interaction trace)`);
  if (demoMcLabel) evidenceLines.push(`Selected action: ${demoMcLabel}`);
  if (demoJustification)
    evidenceLines.push(
      `Justification text: ${demoJustification.slice(0, 160)}${demoJustification.length > 160 ? "…" : ""}`,
    );
  if (demoReflection)
    evidenceLines.push(
      `Reflection text: ${demoReflection.slice(0, 160)}${demoReflection.length > 160 ? "…" : ""}`,
    );
  if (demoTimeSpentSec != null)
    evidenceLines.push(`Time spent in demo: ${Math.round(demoTimeSpentSec)} sec (browser clock)`);
  evidenceLines.push(`Number of trace events: ${eventCount}`);
  evidenceLines.push(`Engagement proxy (dashboard): ${learner.timeSpentMin ?? "—"} min`);

  const sourceFiles: string[] = [];
  if (usingGeneratedJson) {
    if (dialogue) sourceFiles.push("dialogueInsights.json");
    if (risk) sourceFiles.push("learnerRiskPredictions.json");
    if (log?.events?.length) sourceFiles.push("interactionLogs.json");
  } else {
    sourceFiles.push("Mock / rule-based demo merge");
  }
  if (demoJustification || demoReflection || demoMcLabel || demoHotspotClicked || demoTimeSpentSec != null) {
    sourceFiles.push("Local learner demo (browser)");
  }

  const methodNote = usingGeneratedJson
    ? "Baseline ML risk features + heuristic dialogue classifier labels where JSON rows exist; otherwise local demo rules."
    : "Rule-based local demo — connect generated JSON for ML-linked outputs.";

  return {
    learnerId: learner.id,
    riskIndicator,
    prototypeConfidence: Math.round(confidence * 100) / 100,
    reflectionQuality,
    reasoningDepth,
    detectedLearningDifficulty: difficulty,
    suggestedTeacherAction: suggested,
    evidenceLines,
    sourceFiles,
    methodNote,
  };
}
