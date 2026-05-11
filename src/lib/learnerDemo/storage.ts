import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import { getActivePreviewLearnerId, getDemoLearner, recordDemoSubmission } from "@/lib/learnerDemo/demoLearnersStore";

export const LEARNER_DEMO_STORAGE_KEY = "uef-immersive-demo-learner-v1";

export type LearnerDemoEvent = {
  eventType: string;
  step: string;
  hotspot?: string;
  /** @deprecated use selectedAnswer for decision_answer */
  label?: string;
  selectedAnswer?: string;
  text?: string;
  at: string;
  /** Learning module in browser storage (GitHub Pages demo). */
  moduleId?: string;
  /** Scenario / competence track identifier (e.g. module scenario type). */
  scenarioId?: string;
};

export type LearnerDemoPersisted = {
  version: 1;
  learnerId: string;
  submittedAt: string;
  /** submitted = evidence sent to teacher queue */
  learnerScenarioStatus?: "submitted";
  events: LearnerDemoEvent[];
  selectedAction: string;
  justification: string;
  reflection: string;
  timeSpentSec: number;
};

const initialPersisted = (learnerId: string): LearnerDemoPersisted => ({
  version: 1,
  learnerId,
  submittedAt: "",
  events: [],
  selectedAction: "",
  justification: "",
  reflection: "",
  timeSpentSec: 0,
});

function attemptToPersisted(learnerId: string, a: NonNullable<ReturnType<typeof getDemoLearner>>["attempts"][number]): LearnerDemoPersisted {
  return {
    version: 1,
    learnerId,
    submittedAt: a.submittedAt,
    learnerScenarioStatus: "submitted",
    events: a.events,
    selectedAction: a.selectedAction,
    justification: a.justification,
    reflection: a.reflection,
    timeSpentSec: a.timeSpentSec,
  };
}

export function readLearnerDemoState(learnerId?: string): LearnerDemoPersisted | null {
  if (typeof window === "undefined") return null;
  const id = learnerId ?? getActivePreviewLearnerId();
  const rec = getDemoLearner(id);
  if (rec?.attempts?.length) {
    const last = rec.attempts[rec.attempts.length - 1];
    if (last.submittedAt) return attemptToPersisted(id, last);
  }
  try {
    const raw = window.localStorage.getItem(LEARNER_DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LearnerDemoPersisted>;
    if (parsed.version !== 1 || !parsed.submittedAt) return null;
    const lid = id === DEMO_MOBILE_LEARNER_ID && parsed.learnerId ? String(parsed.learnerId) : id;
    return { ...initialPersisted(lid), ...parsed, version: 1, learnerId: lid };
  } catch {
    return null;
  }
}

export function readLearnerDemoDraft(learnerId?: string): Partial<LearnerDemoPersisted> | null {
  if (typeof window === "undefined") return null;
  const id = learnerId ?? getActivePreviewLearnerId();
  try {
    const raw = window.localStorage.getItem(`${LEARNER_DEMO_STORAGE_KEY}-draft:${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<LearnerDemoPersisted>;
  } catch {
    return null;
  }
}

export function writeLearnerDemoDraft(partial: Partial<LearnerDemoPersisted>, learnerId?: string) {
  if (typeof window === "undefined") return;
  const id = learnerId ?? partial.learnerId ?? getActivePreviewLearnerId();
  try {
    window.localStorage.setItem(`${LEARNER_DEMO_STORAGE_KEY}-draft:${id}`, JSON.stringify({ ...partial, learnerId: id }));
  } catch {
    /* ignore quota */
  }
}

export function clearLearnerDemoDraft(learnerId?: string) {
  if (typeof window === "undefined") return;
  const id = learnerId ?? getActivePreviewLearnerId();
  try {
    window.localStorage.removeItem(`${LEARNER_DEMO_STORAGE_KEY}-draft:${id}`);
  } catch {
    /* ignore */
  }
}

export function saveLearnerDemoSubmission(
  payload: Omit<LearnerDemoPersisted, "version" | "learnerId"> & Partial<Pick<LearnerDemoPersisted, "learnerScenarioStatus">> & {
    learnerId?: string;
    mcChoiceIndex?: number | null;
    wrongActionChoice?: boolean;
    shortJustification?: boolean;
    skippedSteps?: boolean;
  },
) {
  if (typeof window === "undefined") return;
  const learnerId = payload.learnerId ?? getActivePreviewLearnerId();
  recordDemoSubmission(learnerId, {
    submittedAt: payload.submittedAt,
    events: payload.events,
    selectedAction: payload.selectedAction,
    justification: payload.justification,
    reflection: payload.reflection,
    timeSpentSec: payload.timeSpentSec,
    mcChoiceIndex: payload.mcChoiceIndex ?? null,
    wrongActionChoice: Boolean(payload.wrongActionChoice),
    shortJustification: Boolean(payload.shortJustification),
    skippedSteps: Boolean(payload.skippedSteps),
  });
  try {
    window.localStorage.removeItem(LEARNER_DEMO_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  clearLearnerDemoDraft(learnerId);
}

export function learnerDemoSubmitted(learnerId?: string): boolean {
  return Boolean(readLearnerDemoState(learnerId)?.submittedAt);
}
