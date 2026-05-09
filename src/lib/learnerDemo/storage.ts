import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import { resetLearnerWorkflow } from "@/lib/workflow/teacherWorkflowStorage";

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

const initialPersisted = (): LearnerDemoPersisted => ({
  version: 1,
  learnerId: DEMO_MOBILE_LEARNER_ID,
  submittedAt: "",
  events: [],
  selectedAction: "",
  justification: "",
  reflection: "",
  timeSpentSec: 0,
});

export function readLearnerDemoState(): LearnerDemoPersisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEARNER_DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LearnerDemoPersisted>;
    if (parsed.version !== 1 || !parsed.submittedAt) return null;
    return { ...initialPersisted(), ...parsed, version: 1, learnerId: DEMO_MOBILE_LEARNER_ID };
  } catch {
    return null;
  }
}

export function readLearnerDemoDraft(): Partial<LearnerDemoPersisted> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${LEARNER_DEMO_STORAGE_KEY}-draft`);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<LearnerDemoPersisted>;
  } catch {
    return null;
  }
}

export function writeLearnerDemoDraft(partial: Partial<LearnerDemoPersisted>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${LEARNER_DEMO_STORAGE_KEY}-draft`, JSON.stringify(partial));
  } catch {
    /* ignore quota */
  }
}

export function clearLearnerDemoDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${LEARNER_DEMO_STORAGE_KEY}-draft`);
  } catch {
    /* ignore */
  }
}

export function saveLearnerDemoSubmission(
  payload: Omit<LearnerDemoPersisted, "version" | "learnerId"> & Partial<Pick<LearnerDemoPersisted, "learnerScenarioStatus">>,
) {
  if (typeof window === "undefined") return;
  const full: LearnerDemoPersisted = {
    version: 1,
    learnerId: DEMO_MOBILE_LEARNER_ID,
    learnerScenarioStatus: "submitted",
    ...payload,
  };
  try {
    window.localStorage.setItem(LEARNER_DEMO_STORAGE_KEY, JSON.stringify(full));
    clearLearnerDemoDraft();
    resetLearnerWorkflow(DEMO_MOBILE_LEARNER_ID);
  } catch {
    /* ignore */
  }
}

export function learnerDemoSubmitted(): boolean {
  return Boolean(readLearnerDemoState()?.submittedAt);
}
