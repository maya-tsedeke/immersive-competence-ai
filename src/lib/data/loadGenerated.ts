import { existsSync, readFileSync } from "fs";
import path from "path";

import type {
  ClassAiInsight,
  CompetenceTrendPoint,
  CompletionSlice,
  DialogueInsight,
  EngagementSlice,
  HotspotBarItem,
  InteractionLog,
  Learner,
  LearnerRiskPrediction,
  LearnerStatus,
  ReportSummary,
  RubricRow,
  ScenarioAnalyticsBundle,
  TimelineEvent,
} from "@/lib/types";
import { classAiInsights } from "@/lib/data/aiInsights";
import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import {
  competenceTrend,
  completionDonut,
  engagementDistribution,
  hotspotCompletion,
} from "@/lib/data/dashboard";
import { learners as mockLearners } from "@/lib/data/learners";
import { reportPreview } from "@/lib/data/reports";
import {
  learningPathway,
  scenarioInteractionEvents,
} from "@/lib/data/scenarioAnalytics";

const GENERATED_DIR = path.join(process.cwd(), "src", "lib", "generated");

function readGeneratedJson<T>(filename: string): T | null {
  const full = path.join(GENERATED_DIR, filename);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

function normalizeLearner(row: Record<string, unknown>): Learner {
  return {
    id: String(row.id),
    score: Number(row.score ?? 0),
    engagement: row.engagement as Learner["engagement"],
    reflection: row.reflection as Learner["reflection"],
    status: row.status as Learner["status"],
    completedAt: row.completedAt as string | undefined,
    timeSpentMin: typeof row.timeSpentMin === "number" ? row.timeSpentMin : Number(row.timeSpentMin ?? 0),
    riskScore: row.riskScore != null ? Number(row.riskScore) : undefined,
    sourceStudentId: row.sourceStudentId != null ? String(row.sourceStudentId) : undefined,
    predictedOutcome: row.predictedOutcome != null ? String(row.predictedOutcome) : undefined,
  };
}

export function usingGeneratedData(): boolean {
  const dash = readGeneratedJson<{ learners?: unknown[] }>("dashboardLearners.json");
  return Boolean(dash?.learners?.length);
}

export function getGeneratedMeta(): Record<string, unknown> | null {
  const dash = readGeneratedJson<{ meta?: Record<string, unknown> }>("dashboardLearners.json");
  return dash?.meta ?? null;
}

export function getLearnerRiskPredictions(): LearnerRiskPrediction[] {
  const rows = readGeneratedJson<LearnerRiskPrediction[]>("learnerRiskPredictions.json");
  return rows?.length ? rows : [];
}

/** Thresholds for mapping continuous risk score → learner indicator (UI only). */
export function statusFromRiskScore(score: number): LearnerStatus {
  if (score >= 0.65) return "At risk";
  if (score >= 0.35) return "Needs feedback";
  return "Strong";
}

export function getPredictionCohortCounts(): {
  total: number;
  atRisk: number;
  needsFeedback: number;
  strong: number;
} {
  const preds = getLearnerRiskPredictions();
  if (!preds.length) {
    return { total: 0, atRisk: 0, needsFeedback: 0, strong: 0 };
  }
  let atRisk = 0;
  let needsFeedback = 0;
  let strong = 0;
  for (const p of preds) {
    const s = statusFromRiskScore(Number(p.riskScore));
    if (s === "At risk") atRisk += 1;
    else if (s === "Needs feedback") needsFeedback += 1;
    else strong += 1;
  }
  return { total: preds.length, atRisk, needsFeedback, strong };
}

export function getDialogueInsights(): DialogueInsight[] {
  const rows = readGeneratedJson<DialogueInsight[]>("dialogueInsights.json");
  return rows?.length ? rows : [];
}

export function getInteractionLogs(): InteractionLog[] {
  const rows = readGeneratedJson<InteractionLog[]>("interactionLogs.json");
  return rows?.length ? rows : [];
}

export function getRubricByLearner(): Record<string, RubricRow[]> {
  const raw = readGeneratedJson<Record<string, RubricRow[]>>("rubricByLearner.json");
  return raw && typeof raw === "object" ? raw : {};
}

function demoMobileLearnerRow(): Learner {
  return {
    id: DEMO_MOBILE_LEARNER_ID,
    score: 64,
    engagement: "Medium",
    reflection: "Medium",
    status: "Needs feedback",
    displayStatus: "Needs feedback",
    completedAt: undefined,
    timeSpentMin: 8,
    riskScore: 0.48,
  };
}

function withDemoMobileLearner(rows: Learner[]): Learner[] {
  if (rows.some((r) => r.id === DEMO_MOBILE_LEARNER_ID)) return rows;
  return [...rows, demoMobileLearnerRow()];
}

export function getLearners(): Learner[] {
  const dash = readGeneratedJson<{ learners: Record<string, unknown>[] }>("dashboardLearners.json");
  if (!dash?.learners?.length) {
    return withDemoMobileLearner(mockLearners.map((l) => ({ ...l, displayStatus: l.displayStatus ?? l.status })));
  }

  const preds = getLearnerRiskPredictions();
  const predById = new Map(preds.map((p) => [p.learnerId, p]));

  const mapped = dash.learners.map((row) => {
    const base = normalizeLearner(row);
    const p = predById.get(base.id);
    const displayStatus: LearnerStatus = p ? statusFromRiskScore(Number(p.riskScore)) : base.status;
    if (!p) {
      return { ...base, displayStatus };
    }
    return {
      ...base,
      riskScore: p.riskScore,
      predictedOutcome: p.predictedOutcome,
      sourceStudentId: p.sourceStudentId,
      displayStatus,
    };
  });

  return withDemoMobileLearner(mapped);
}

export function getLearnerById(id: string): Learner | undefined {
  return getLearners().find((l) => l.id === id);
}

function dominantLabel(rows: DialogueInsight[], key: "reflectionQuality" | "reasoningDepth"): string {
  if (!rows.length) return "Medium–High";
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = String(r[key] ?? "").trim() || "Unknown";
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best = "";
  let max = -1;
  for (const [k, c] of counts) {
    if (c > max) {
      max = c;
      best = k;
    }
  }
  return best || "—";
}

/** KPIs derived from generated learners + dialogue when using ML JSON. */
export function computeDynamicKpi(learners: Learner[], dialogue: DialogueInsight[]): ScenarioAnalyticsBundle["kpi"] {
  const n = learners.length || 1;
  const avgScorePct = Math.round(learners.reduce((s, l) => s + l.score, 0) / n);
  const visAtRisk = learners.filter((l) => (l.displayStatus ?? l.status) === "At risk").length;
  const avgEngagementMin =
    Math.round(
      (learners.reduce((s, l) => s + (l.timeSpentMin ?? 0), 0) / n + Number.EPSILON) * 10,
    ) / 10;

  const rawReflection = dominantLabel(dialogue, "reflectionQuality");
  const reflectionLabel =
    rawReflection === "Unknown" || rawReflection === "—" || !dialogue.length ? "Medium" : rawReflection.trim();
  const reflectionSubtitle = dialogue.length
    ? "Dominant reflection-quality level"
    : "Scenario KPI or mock cohort";

  const pred = getPredictionCohortCounts();

  const atRiskRatio = visAtRisk / n;
  let cohortSampleNote: string | undefined;
  if (pred.total > 0 && atRiskRatio >= 0.6) {
    cohortSampleNote =
      "Visible dashboard list skews high-risk; full distribution from learnerRiskPredictions.json shown in learner filters.";
  }

  return {
    avgScorePct,
    learnersAtRiskCount: visAtRisk,
    predictionAtRiskCount: pred.total ? pred.atRisk : undefined,
    predictionNeedsFeedbackCount: pred.total ? pred.needsFeedback : undefined,
    predictionStrongCount: pred.total ? pred.strong : undefined,
    avgEngagementMin,
    reflectionLabel,
    reflectionSubtitle,
    cohortSampleNote,
  };
}

function mockScenarioBundle(): ScenarioAnalyticsBundle {
  return {
    scenarioInteractionEvents,
    learningPathway,
    hotspotCompletion,
    engagementDistribution,
    competenceTrend,
    completionDonut,
    keyInsight:
      "Learners show strong observation skills but weaker justification and reflection quality in the mock layer.",
    kpi: {
      avgScorePct: 73,
      learnersAtRiskCount: 5,
      avgEngagementMin: 14.2,
      reflectionLabel: "Medium",
      reflectionSubtitle: "Dominant reflection-quality level · mock cohort",
    },
  };
}

export function getScenarioAnalytics(): ScenarioAnalyticsBundle {
  const raw = readGeneratedJson<Partial<ScenarioAnalyticsBundle>>("scenarioAnalytics.json");
  const fallback = mockScenarioBundle();

  if (!raw || typeof raw !== "object") return fallback;

  const hasContent =
    (Array.isArray(raw.scenarioInteractionEvents) && raw.scenarioInteractionEvents.length > 0) ||
    (Array.isArray(raw.competenceTrend) && raw.competenceTrend.length > 0) ||
    (Array.isArray(raw.hotspotCompletion) && raw.hotspotCompletion.length > 0);

  if (!hasContent) return fallback;

  return {
    scenarioInteractionEvents:
      (raw.scenarioInteractionEvents as TimelineEvent[]) ?? fallback.scenarioInteractionEvents,
    learningPathway: raw.learningPathway ?? fallback.learningPathway,
    hotspotCompletion: (raw.hotspotCompletion as HotspotBarItem[]) ?? fallback.hotspotCompletion,
    engagementDistribution:
      (raw.engagementDistribution as EngagementSlice[]) ?? fallback.engagementDistribution,
    competenceTrend: (raw.competenceTrend as CompetenceTrendPoint[]) ?? fallback.competenceTrend,
    completionDonut: (raw.completionDonut as CompletionSlice[]) ?? fallback.completionDonut,
    keyInsight: raw.keyInsight ?? fallback.keyInsight,
    kpi: raw.kpi ?? fallback.kpi,
    mappingNote: raw.mappingNote,
  };
}

export function getAiInsights(): ClassAiInsight[] {
  const raw = readGeneratedJson<ClassAiInsight[]>("aiInsights.json");
  if (raw?.length) return raw;
  return classAiInsights;
}

export function getReportSummary(): ReportSummary {
  const raw = readGeneratedJson<ReportSummary>("reportSummary.json");
  if (raw?.title) return raw;
  return reportPreview;
}

export function getInteractionLogForLearner(learnerId: string): InteractionLog | undefined {
  return getInteractionLogs().find((l) => l.learnerId === learnerId);
}

export function getRubricForLearnerGenerated(learnerId: string): RubricRow[] | undefined {
  const raw = getRubricByLearner();
  if (raw && raw[learnerId]) return raw[learnerId];
  return undefined;
}

export function getDialogueInsightForLearner(learnerId: string): DialogueInsight | undefined {
  return getDialogueInsights().find((r) => r.learnerId === learnerId);
}

export function getRiskPredictionForLearner(learnerId: string): LearnerRiskPrediction | undefined {
  return getLearnerRiskPredictions().find((r) => r.learnerId === learnerId);
}
