import type { LearnerDemoEvent } from "@/lib/learnerDemo/storage";
import { LEARNER_DEMO_STORAGE_KEY } from "@/lib/learnerDemo/storage";
import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import { dispatchWorkflowChanged, resetLearnerWorkflow } from "@/lib/workflow/teacherWorkflowStorage";

export const DEMO_LEARNERS_STORAGE_KEY = "immersive_competence_ai_demo_learners";
export const DEMO_ACTIVE_LEARNER_KEY = "immersive_competence_ai_active_learner";
export const DEMO_LEARNERS_CHANGE_EVENT = "immersive-demo-learners-changed";

export type DemoStartMode = "learner_now" | "teacher_queue";

export type DemoActivityType = {
  at: string;
  learnerId: string;
  message: string;
};

export type DemoSessionAttempt = {
  attemptNumber: number;
  submittedAt: string;
  events: LearnerDemoEvent[];
  selectedAction: string;
  justification: string;
  reflection: string;
  timeSpentSec: number;
  mcChoiceIndex: number | null;
  wrongActionChoice: boolean;
  shortJustification: boolean;
  skippedSteps: boolean;
};

export type DemoLearningStatusLabel =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "reviewed"
  | "improving"
  | "needs_feedback"
  | "resubmission_required"
  | "teacher_reviewed";

export type DemoLearnerRecord = {
  id: string;
  displayName: string;
  scenarioTitle: string;
  /** Optional link to a learning module in browser storage (`/modules`). */
  moduleId?: string;
  objective: string;
  startMode: DemoStartMode;
  createdAt: string;
  learningStatus: DemoLearningStatusLabel;
  progressPct: number;
  attempts: DemoSessionAttempt[];
};

type StoreV1 = {
  version: 1;
  learners: Record<string, DemoLearnerRecord>;
  activity: DemoActivityType[];
};

const MAX_ACTIVITY = 80;

function emptyStore(): StoreV1 {
  return { version: 1, learners: {}, activity: [] };
}

function readStore(): StoreV1 {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(DEMO_LEARNERS_STORAGE_KEY);
    if (!raw) return migrateLegacyIfNeeded(emptyStore());
    const parsed = JSON.parse(raw) as Partial<StoreV1>;
    if (parsed.version !== 1 || !parsed.learners || typeof parsed.learners !== "object") {
      return migrateLegacyIfNeeded(emptyStore());
    }
    const out: StoreV1 = {
      version: 1,
      learners: parsed.learners as Record<string, DemoLearnerRecord>,
      activity: Array.isArray(parsed.activity) ? parsed.activity.slice(-MAX_ACTIVITY) : [],
    };
    if (Object.keys(out.learners).length === 0) {
      return migrateLegacyIfNeeded(out);
    }
    return out;
  } catch {
    return emptyStore();
  }
}

function writeStore(s: StoreV1) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_LEARNERS_STORAGE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent(DEMO_LEARNERS_CHANGE_EVENT));
  } catch {
    /* quota */
  }
}

function migrateLegacyIfNeeded(base: StoreV1): StoreV1 {
  if (typeof window === "undefined") return base;
  try {
    const leg = window.localStorage.getItem(LEARNER_DEMO_STORAGE_KEY);
    if (!leg) return base;
    const parsed = JSON.parse(leg) as {
      submittedAt?: string;
      events?: LearnerDemoEvent[];
      selectedAction?: string;
      justification?: string;
      reflection?: string;
      timeSpentSec?: number;
    };
    if (!parsed?.submittedAt) return base;
    const id = DEMO_MOBILE_LEARNER_ID;
    if (base.learners[id]) return base;
    const attempt: DemoSessionAttempt = {
      attemptNumber: 1,
      submittedAt: parsed.submittedAt,
      events: parsed.events ?? [],
      selectedAction: String(parsed.selectedAction ?? ""),
      justification: String(parsed.justification ?? ""),
      reflection: String(parsed.reflection ?? ""),
      timeSpentSec: Number(parsed.timeSpentSec ?? 0),
      mcChoiceIndex: null,
      wrongActionChoice: false,
      shortJustification: String(parsed.justification ?? "").trim().length < 40,
      skippedSteps: false,
    };
    base.learners[id] = {
      id,
      displayName: "Anonymous",
      scenarioTitle: "Workplace Safety Simulation",
      objective: "Identify workplace hazards and justify safe actions",
      startMode: "learner_now",
      createdAt: parsed.submittedAt,
      learningStatus: "submitted",
      progressPct: 100,
      attempts: [attempt],
    };
    writeStore(base);
  } catch {
    /* ignore */
  }
  return base;
}

export function dispatchDemoLearnersChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DEMO_LEARNERS_CHANGE_EVENT));
}

export function listDemoLearnerRecords(): DemoLearnerRecord[] {
  const s = readStore();
  return Object.values(s.learners).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getDemoLearner(id: string): DemoLearnerRecord | null {
  return readStore().learners[id] ?? null;
}

export function appendDemoActivity(learnerId: string, message: string) {
  const s = readStore();
  s.activity.push({ at: new Date().toISOString(), learnerId, message });
  s.activity = s.activity.slice(-MAX_ACTIVITY);
  writeStore(s);
}

export function nextDemoLearnerId(): string {
  const s = readStore();
  let max = 0;
  for (const k of Object.keys(s.learners)) {
    const m = /^Demo-(\d+)$/i.exec(k);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  const n = max + 1;
  return `Demo-${String(n).padStart(3, "0")}`;
}

export function createDemoLearner(input: {
  id?: string;
  displayName: string;
  scenarioTitle: string;
  objective: string;
  startMode: DemoStartMode;
  moduleId?: string;
}): DemoLearnerRecord {
  const s = readStore();
  const id = input.id?.trim() || nextDemoLearnerId();
  const row: DemoLearnerRecord = {
    id,
    displayName: input.displayName.trim() || "Anonymous",
    scenarioTitle: input.scenarioTitle.trim(),
    moduleId: input.moduleId?.trim() || undefined,
    objective: input.objective.trim(),
    startMode: input.startMode,
    createdAt: new Date().toISOString(),
    learningStatus: "not_started",
    progressPct: 0,
    attempts: [],
  };
  s.learners[id] = row;
  s.activity.push({
    at: new Date().toISOString(),
    learnerId: id,
    message: `${id} created — ${input.startMode === "learner_now" ? "start as learner" : "queued for teacher"}`,
  });
  s.activity = s.activity.slice(-MAX_ACTIVITY);
  writeStore(s);
  resetLearnerWorkflow(id);
  return row;
}

export function updateDemoLearnerPartial(id: string, partial: Partial<DemoLearnerRecord>) {
  const s = readStore();
  const prev = s.learners[id];
  if (!prev) return;
  s.learners[id] = { ...prev, ...partial };
  writeStore(s);
}

export function recordDemoSubmission(
  learnerId: string,
  payload: Omit<DemoSessionAttempt, "attemptNumber"> & { attemptNumber?: number },
) {
  const s = readStore();
  let prev = s.learners[learnerId];
  if (!prev) {
    prev = {
      id: learnerId,
      displayName: "Anonymous",
      scenarioTitle: "Workplace Safety Simulation",
      objective: "Identify workplace hazards and justify safe actions",
      startMode: "learner_now",
      createdAt: new Date().toISOString(),
      learningStatus: "in_progress",
      progressPct: 0,
      attempts: [],
    };
    s.learners[learnerId] = prev;
  }
  const attemptNo = payload.attemptNumber ?? prev.attempts.length + 1;
  const attempt: DemoSessionAttempt = {
    attemptNumber: attemptNo,
    submittedAt: payload.submittedAt,
    events: payload.events,
    selectedAction: payload.selectedAction,
    justification: payload.justification,
    reflection: payload.reflection,
    timeSpentSec: payload.timeSpentSec,
    mcChoiceIndex: payload.mcChoiceIndex ?? null,
    wrongActionChoice: payload.wrongActionChoice,
    shortJustification: payload.shortJustification,
    skippedSteps: payload.skippedSteps,
  };
  const attempts = [...prev.attempts.filter((a) => a.attemptNumber !== attemptNo), attempt].sort(
    (a, b) => a.attemptNumber - b.attemptNumber,
  );
  s.learners[learnerId] = {
    ...prev,
    attempts,
    learningStatus: "submitted",
    progressPct: 100,
  };
  writeStore(s);
  resetLearnerWorkflow(learnerId);
  dispatchWorkflowChanged();
  appendDemoActivity(learnerId, `${learnerId} submitted scenario (attempt ${attemptNo})`);
}

export function setDemoLearnerProgress(learnerId: string, progressPct: number, status: DemoLearningStatusLabel) {
  updateDemoLearnerPartial(learnerId, {
    progressPct: Math.min(100, Math.max(0, Math.round(progressPct))),
    learningStatus: status,
  });
}

export function readDemoActivityLog(): DemoActivityType[] {
  return readStore().activity.slice().reverse();
}

export function getActivePreviewLearnerId(): string {
  if (typeof window === "undefined") return DEMO_MOBILE_LEARNER_ID;
  return window.sessionStorage.getItem(DEMO_ACTIVE_LEARNER_KEY) ?? DEMO_MOBILE_LEARNER_ID;
}

export function setActivePreviewLearnerId(id: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DEMO_ACTIVE_LEARNER_KEY, id);
  dispatchDemoLearnersChanged();
}

export function isDemoLearnerRowId(id: string): boolean {
  if (id === DEMO_MOBILE_LEARNER_ID) return true;
  if (/^Demo-\d+$/i.test(id)) return true;
  return Boolean(getDemoLearner(id));
}
