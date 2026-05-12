import type { AiAnalysisBundle, Learner } from "@/lib/types";
import type { DemoSessionAttempt } from "@/lib/learnerDemo/demoLearnersStore";

const CORRECT_MC_INDEX = 0;

function clampConfidence(n: number): number {
  return Math.min(0.94, Math.max(0.35, Math.round(n * 100) / 100));
}

/** Vary prototype confidence for otherwise "clean" attempts so different texts produce different AI summaries. */
function confidenceForCleanAttempt(attempt: DemoSessionAttempt, scanTour: boolean): number {
  const j = attempt.justification.trim().length;
  const r = attempt.reflection.trim().length;

  let c = 0.68;
  if (scanTour) c += 0.05;

  if (j >= 220) c += 0.1;
  else if (j >= 140) c += 0.07;
  else if (j >= 96) c += 0.04;
  else c += 0.02;

  if (r >= 200) c += 0.08;
  else if (r >= 120) c += 0.05;
  else if (r >= 72) c += 0.03;
  else if (r >= 40) c += 0.01;
  else c -= 0.04;

  return clampConfidence(c);
}

/** Rule-based AI bundle for local demo learners from scenario attempt shape. */
export function buildDemoScenarioAiBundle(learner: Learner, attempt: DemoSessionAttempt): AiAnalysisBundle {
  const scanTour = attempt.events.some((e) => e.eventType === "scene_scan");

  const evidenceLines: string[] = [];
  for (const e of attempt.events) {
    evidenceLines.push(`${e.eventType}${e.hotspot ? ` · ${e.hotspot}` : ""}${e.text ? ` · ${e.text.slice(0, 120)}` : ""}`);
  }
  evidenceLines.push(
    `Guided hotspot tour (demo UI): ${scanTour ? "used — optional animation that highlights each learning marker in the panoramic scene" : "not used — learner may still have opened hotspots manually"}`,
  );
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
  let confidence = confidenceForCleanAttempt(attempt, scanTour);

  const jLen = attempt.justification.trim().length;
  const rLen = attempt.reflection.trim().length;
  if (!attempt.skippedSteps && !attempt.wrongActionChoice && !attempt.shortJustification) {
    if (rLen < 40) {
      reflectionQuality = "Low";
      reasoningDepth = jLen >= 120 ? "Developing" : "Developing";
    } else if (rLen < 90) {
      reflectionQuality = "Medium";
      reasoningDepth = jLen >= 160 ? "Good" : "Developing";
    } else {
      reflectionQuality = "High";
      reasoningDepth = jLen >= 180 && scanTour ? "Good" : jLen >= 120 ? "Good" : "Developing";
    }
    if (rLen < 40) {
      detected =
        "Submission is complete, but the reflection is very short — limited evidence of consolidation.";
      suggested = "Ask the learner to restate what changed in their understanding after observing the scene.";
    }
  }

  if (attempt.skippedSteps) {
    riskIndicator = "At risk";
    reasoningDepth = "Needs support";
    detected = "Learner skipped required steps or did not complete the Observe -> Decide -> Justify -> Reflect pathway in order.";
    suggested = "Request resubmission with guided sequence: observe evidence -> decision -> justification -> reflection.";
    confidence = clampConfidence(0.58 + (scanTour ? 0.04 : 0) + Math.min(0.06, jLen / 600));
  } else if (attempt.wrongActionChoice) {
    riskIndicator = "Needs feedback";
    detected = "Learner opened evidence but selected a weakly supported action.";
    suggested = "Ask the learner to compare two possible actions against the observed evidence.";
    reasoningDepth = "Needs support";
    reflectionQuality = "Medium";
    confidence = clampConfidence(0.66 + Math.min(0.07, jLen / 500));
  } else if (attempt.shortJustification) {
    riskIndicator = "Needs feedback";
    detected = "Learner selected a plausible action but did not justify why it fits the evidence.";
    suggested = "Ask the learner to explain the link between evidence, decision, and competence criterion.";
    reasoningDepth = "Developing";
    reflectionQuality = attempt.reflection.trim().length > 60 ? "Medium" : "Low";
    confidence = clampConfidence(0.68 + Math.min(0.06, rLen / 450));
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
      "Heuristic demo classifier: pathway order, MC choice, justification and reflection length, optional guided hotspot tour (scene_scan in events). Not computer vision — tour highlights markers on the panorama. Teacher interpretation required.",
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
