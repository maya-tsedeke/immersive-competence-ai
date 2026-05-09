import type { AiAnalysisBundle, Learner } from "@/lib/types";
import type { DemoSessionAttempt } from "@/lib/learnerDemo/demoLearnersStore";

const CORRECT_MC_INDEX = 0;

/** Rule-based AI bundle for local demo learners from scenario attempt shape. */
export function buildDemoScenarioAiBundle(learner: Learner, attempt: DemoSessionAttempt): AiAnalysisBundle {
  const evidenceLines: string[] = [];
  for (const e of attempt.events) {
    evidenceLines.push(`${e.eventType}${e.hotspot ? ` · ${e.hotspot}` : ""}${e.text ? ` · ${e.text.slice(0, 120)}` : ""}`);
  }
  evidenceLines.push(`Selected action: ${attempt.selectedAction || "—"}`);
  evidenceLines.push(
    `Justification: ${attempt.justification.slice(0, 160)}${attempt.justification.length > 160 ? "…" : ""}`,
  );
  evidenceLines.push(`Reflection: ${attempt.reflection.slice(0, 160)}${attempt.reflection.length > 160 ? "…" : ""}`);
  evidenceLines.push(`Time in scenario: ${attempt.timeSpentSec}s`);

  let riskIndicator: AiAnalysisBundle["riskIndicator"] = "Strong";
  let reasoningDepth = "Good";
  let reflectionQuality = "High";
  let detected =
    "No strong learning difficulty detected in this demo response.";
  let suggested = "Ask the learner to transfer the reasoning to another scenario.";
  let confidence = 0.82;

  if (attempt.skippedSteps) {
    riskIndicator = "At risk";
    reasoningDepth = "Needs support";
    detected = "Learner skipped required steps or did not complete the observation → action pathway in order.";
    suggested = "Request resubmission with guided sequence: hazard → safe action → justification → reflection.";
    confidence = 0.62;
  } else if (attempt.wrongActionChoice) {
    riskIndicator = "Needs feedback";
    detected = "Learner identified the hazard but selected an unsafe action.";
    suggested = "Ask the learner to compare safe and unsafe actions.";
    reasoningDepth = "Needs support";
    reflectionQuality = "Medium";
    confidence = 0.71;
  } else if (attempt.shortJustification) {
    riskIndicator = "Needs feedback";
    detected = "Learner selected a safe action but did not justify why it reduces risk.";
    suggested = "Ask the learner to explain the causal link between action and risk reduction.";
    reasoningDepth = "Developing";
    reflectionQuality = attempt.reflection.trim().length > 60 ? "Medium" : "Low";
    confidence = 0.73;
  }

  return {
    learnerId: learner.id,
    riskIndicator,
    prototypeConfidence: confidence,
    reflectionQuality,
    reasoningDepth,
    detectedLearningDifficulty: detected,
    suggestedTeacherAction: suggested,
    evidenceLines,
    sourceFiles: [
      "Local immersive scenario (browser)",
      "Rule-based pedagogy demo — not ML inference",
    ],
    methodNote:
      "Heuristic demo classifier from hotspot order, decision choice, and text length — teacher interpretation required.",
  };
}

export function analyzeAttemptFlags(input: {
  mcChoiceIndex: number | null;
  justification: string;
  reflection: string;
  justifyTapped: boolean;
  reflectTapped: boolean;
}): Pick<DemoSessionAttempt, "wrongActionChoice" | "shortJustification" | "skippedSteps"> {
  const wrongActionChoice = input.mcChoiceIndex != null && input.mcChoiceIndex !== CORRECT_MC_INDEX;
  const shortJustification = input.justification.trim().length > 0 && input.justification.trim().length < 48;
  const skippedSteps = !input.justifyTapped || !input.reflectTapped;
  return {
    wrongActionChoice,
    shortJustification: shortJustification || input.justification.trim().length === 0,
    skippedSteps,
  };
}
