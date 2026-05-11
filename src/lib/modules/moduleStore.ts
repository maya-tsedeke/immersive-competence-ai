import type {
  DatasetProfileId,
  DialogueReflectionRecord,
  LearningAnalyticsRecord,
  LearningModule,
  ScenarioTypeId,
} from "@/lib/modules/learningModuleTypes";
import { DATASET_PROFILE_LABELS, SCENARIO_TYPE_LABELS } from "@/lib/modules/learningModuleTypes";

export const MODULES_STORAGE_KEY = "ica_learning_modules_v1";
export const MODULES_CHANGE_EVENT = "ica-modules-changed";

type ModuleStoreV1 = { version: 1; modules: LearningModule[] };

function empty(): ModuleStoreV1 {
  return { version: 1, modules: [] };
}

function read(): ModuleStoreV1 {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(MODULES_STORAGE_KEY);
    if (!raw) return seedTemplatesIfEmpty(empty());
    const p = JSON.parse(raw) as ModuleStoreV1;
    if (p.version !== 1 || !Array.isArray(p.modules)) return seedTemplatesIfEmpty(empty());
    return p.modules.length ? p : seedTemplatesIfEmpty(p);
  } catch {
    return seedTemplatesIfEmpty(empty());
  }
}

function write(s: ModuleStoreV1) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent(MODULES_CHANGE_EVENT));
  } catch {
    /* quota */
  }
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i);
  return Math.abs(h);
}

function rand(seed: number, i: number): number {
  const x = Math.sin(seed * 9999 + i * 1777) * 10000;
  return x - Math.floor(x);
}

function generateAnalyticsRow(
  module: Pick<LearningModule, "id" | "title" | "scenarioType">,
  index: number,
): LearningAnalyticsRecord {
  const seed = hashSeed(`${module.id}-${index}`);
  const interactions = 12 + Math.floor(rand(seed, 1) * 120);
  const days = 1 + Math.floor(rand(seed, 2) * 28);
  const score = 40 + Math.floor(rand(seed, 3) * 55);
  const riskRoll = rand(seed, 4);
  const learnerRiskStatus: LearningAnalyticsRecord["learnerRiskStatus"] =
    riskRoll > 0.75 ? "High" : riskRoll > 0.45 ? "Medium" : "Low";
  const outcomeRoll = rand(seed, 5);
  const finalLearningOutcome: LearningAnalyticsRecord["finalLearningOutcome"] =
    outcomeRoll > 0.85 ? "Withdrawn" : outcomeRoll > 0.12 ? "Pass" : "In progress";
  const lid = `SYN-${module.id.slice(0, 8).toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
  const d0 = new Date();
  d0.setDate(d0.getDate() - days);
  const d1 = new Date();
  return {
    learnerId: lid,
    moduleId: module.id,
    moduleTitle: module.title,
    scenarioId: module.scenarioType,
    totalLearningInteractions: interactions,
    activeLearningDays: days,
    firstActivityDate: d0.toISOString().slice(0, 10),
    lastActivityDate: d1.toISOString().slice(0, 10),
    averageInteractionsPerActiveDay: Math.round((interactions / Math.max(1, days)) * 10) / 10,
    assessmentSubmittedCount: Math.min(12, 1 + Math.floor(rand(seed, 6) * 4)),
    averageAssessmentScore: score,
    weightedAssessmentScore: Math.min(100, Math.round(score * 0.92 + rand(seed, 7) * 8)),
    early25Interactions: Math.floor(interactions * (0.2 + rand(seed, 8) * 0.1)),
    early50Interactions: Math.floor(interactions * (0.45 + rand(seed, 9) * 0.1)),
    early75Interactions: Math.floor(interactions * (0.7 + rand(seed, 10) * 0.1)),
    finalLearningOutcome,
    learnerRiskStatus,
  };
}

function generateDialogueRow(
  module: Pick<LearningModule, "id">,
  index: number,
): DialogueReflectionRecord {
  const seed = hashSeed(`dlg-${module.id}-${index}`);
  const turns = 4 + Math.floor(rand(seed, 1) * 24);
  const len = 24 + Math.floor(rand(seed, 2) * 220);
  const rq: DialogueReflectionRecord["reflectionQuality"] =
    rand(seed, 3) > 0.66 ? "High" : rand(seed, 4) > 0.4 ? "Medium" : "Low";
  const rd: DialogueReflectionRecord["reasoningDepth"] =
    rand(seed, 5) > 0.7 ? "Proficient" : rand(seed, 6) > 0.35 ? "Developing" : "Early";
  return {
    learnerId: `SYN-${module.id.slice(0, 8).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    moduleId: module.id,
    conversationId: `conv-${module.id}-${index}`,
    numberOfDialogueTurns: turns,
    averageLearnerResponseLength: len,
    learnerQuestionCount: Math.floor(rand(seed, 7) * 6),
    uncertaintyIndicators: Math.floor(rand(seed, 8) * 8),
    reasoningIndicators: Math.floor(rand(seed, 9) * 12),
    reflectionIndicators: Math.floor(rand(seed, 10) * 10),
    reflectionQuality: rq,
    detectedLearningDifficulty:
      rq === "Low"
        ? "Heuristic: short reflective turns in sample (instructional signal only)."
        : "No strong difficulty flagged in synthetic excerpt.",
    reasoningDepth: rd,
    teacherFeedbackNeed: rand(seed, 11) > 0.55 ? "Medium" : "Low",
  };
}

function seedTemplatesIfEmpty(s: ModuleStoreV1): ModuleStoreV1 {
  if (s.modules.length > 0) return s;
  const now = new Date().toISOString();
  const tpl = createLearningModuleInternal({
    title: "Workplace Safety (template)",
    scenarioType: "workplace_safety",
    learningObjective: "Observe hazards, decide safe action, justify and reflect.",
    competenceCriteria: "Observation, decision, justification quality, reflection.",
    datasetTemplate: "OULAD engagement + dialogue reflection pairing",
    datasetProfile: "combined",
    simulatedLearnerCount: 12,
    now,
    fixedId: "tpl-workplace-safety",
  });
  s.modules = [tpl];
  write(s);
  return s;
}

function createLearningModuleInternal(input: {
  title: string;
  scenarioType: ScenarioTypeId;
  learningObjective: string;
  competenceCriteria: string;
  datasetTemplate: string;
  datasetProfile: DatasetProfileId;
  simulatedLearnerCount: number;
  now: string;
  fixedId?: string;
}): LearningModule {
  const id =
    input.fixedId ??
    `mod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const n = Math.min(200, Math.max(3, input.simulatedLearnerCount));
  const base: Pick<LearningModule, "id" | "title" | "scenarioType"> = {
    id,
    title: input.title.trim(),
    scenarioType: input.scenarioType,
  };
  const learningAnalyticsPreview = Array.from({ length: n }, (_, i) =>
    generateAnalyticsRow(base, i),
  );
  const dialogueReflectionPreview = Array.from({ length: n }, (_, i) =>
    generateDialogueRow(base, i),
  );
  return {
    id,
    title: input.title.trim(),
    scenarioType: input.scenarioType,
    learningObjective: input.learningObjective.trim(),
    competenceCriteria: input.competenceCriteria.trim(),
    datasetTemplate: input.datasetTemplate.trim(),
    datasetProfile: input.datasetProfile,
    simulatedLearnerCount: n,
    createdAt: input.now,
    updatedAt: input.now,
    learningAnalyticsPreview,
    dialogueReflectionPreview,
  };
}

export function listModules(): LearningModule[] {
  return read().modules.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getModule(id: string): LearningModule | undefined {
  return read().modules.find((m) => m.id === id);
}

export function upsertModule(module: LearningModule) {
  const s = read();
  const idx = s.modules.findIndex((m) => m.id === module.id);
  if (idx >= 0) s.modules[idx] = { ...module, updatedAt: new Date().toISOString() };
  else s.modules.unshift(module);
  write(s);
}

export function upsertModules(modules: LearningModule[]) {
  for (const m of modules) upsertModule(m);
}

export function createLearningModule(input: {
  title: string;
  scenarioType: ScenarioTypeId;
  learningObjective: string;
  competenceCriteria: string;
  datasetTemplate: string;
  datasetProfile: DatasetProfileId;
  simulatedLearnerCount: number;
}): LearningModule {
  const now = new Date().toISOString();
  const row = createLearningModuleInternal({ ...input, now });
  upsertModule(row);
  return row;
}

export function scenarioLabel(t: ScenarioTypeId): string {
  return SCENARIO_TYPE_LABELS[t];
}

export function profileLabel(p: DatasetProfileId): string {
  return DATASET_PROFILE_LABELS[p];
}
