import type { AiAnalysisBundle, LearnerWorkflowPersisted, TeacherDecisionStatus } from "@/lib/types";

export const TEACHER_WORKFLOW_STORAGE_KEY = "uef-immersive-teacher-workflow-v1";

export const WORKFLOW_CHANGE_EVENT = "immersive-workflow-changed";

type WorkflowStore = Record<string, LearnerWorkflowPersisted>;

const defaultRecord = (): LearnerWorkflowPersisted => ({ aiAnalysisComplete: false });

export function dispatchWorkflowChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WORKFLOW_CHANGE_EVENT));
}

export function readWorkflowStore(): WorkflowStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TEACHER_WORKFLOW_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as WorkflowStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getLearnerWorkflowState(learnerId: string): LearnerWorkflowPersisted {
  const s = readWorkflowStore()[learnerId];
  return s ? { ...defaultRecord(), ...s } : defaultRecord();
}

export function resetLearnerWorkflow(learnerId: string): void {
  if (typeof window === "undefined") return;
  const all = readWorkflowStore();
  all[learnerId] = defaultRecord();
  try {
    window.localStorage.setItem(TEACHER_WORKFLOW_STORAGE_KEY, JSON.stringify(all));
    dispatchWorkflowChanged();
  } catch {
    /* quota */
  }
}

export function writeLearnerWorkflowState(learnerId: string, partial: Partial<LearnerWorkflowPersisted>): void {
  if (typeof window === "undefined") return;
  const all = readWorkflowStore();
  const prev = all[learnerId] ?? defaultRecord();
  all[learnerId] = { ...prev, ...partial };
  try {
    window.localStorage.setItem(TEACHER_WORKFLOW_STORAGE_KEY, JSON.stringify(all));
    dispatchWorkflowChanged();
  } catch {
    /* quota */
  }
}

export function persistAiAnalysisResult(learnerId: string, bundle: AiAnalysisBundle): void {
  writeLearnerWorkflowState(learnerId, {
    aiAnalysisComplete: true,
    aiResultBundle: bundle,
    aiAnalyzedAt: new Date().toISOString(),
  });
}

export function persistTeacherDecision(
  learnerId: string,
  status: TeacherDecisionStatus,
  note: string,
): void {
  writeLearnerWorkflowState(learnerId, {
    teacherDecision: {
      status,
      note: note.trim(),
      decidedAt: new Date().toISOString(),
    },
  });
}
