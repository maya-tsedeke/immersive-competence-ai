export type LearnerStatus = "Strong" | "At risk" | "Needs feedback";

export type EngagementLevel = "Low" | "Medium" | "High";

export type ReflectionLevel = "Low" | "Medium" | "High";

export type RubricRating = "Good" | "Developing" | "Needs support";

export interface Scenario {
  id: string;
  title: string;
  description: string;
}

export interface Learner {
  id: string;
  score: number;
  engagement: EngagementLevel;
  reflection: ReflectionLevel;
  status: LearnerStatus;
  completedAt?: string;
  timeSpentMin?: number;
  /** Merged from learnerRiskPredictions.json when available */
  riskScore?: number;
  sourceStudentId?: string;
  predictedOutcome?: string;
  /** When riskScore exists, threshold-based UI status for filters (0.65 / 0.35 cuts). */
  displayStatus?: LearnerStatus;
  /** Browser demo learners merged client-side */
  isLocalDemo?: boolean;
  scenarioTitle?: string;
  demoDisplayName?: string;
  /** 0–100 for operational demo UI */
  demoProgressPct?: number;
  demoLearningStatusLabel?: string;
  /** Human-readable activity status for demo tables (e.g. Submitted, Reviewed) */
  demoLearningActivityStatus?: string;
  demoAiAnalysisLabel?: string;
  /** Risk / outcome summary from last AI run */
  demoAiResultLabel?: string;
  demoAiConfidence?: number;
  demoTeacherDecisionLabel?: string;
  demoActionRequired?: string;
  /** Browser demo: optional learning module id/title from /modules */
  demoModuleId?: string;
  demoModuleTitle?: string;
}

export interface TimelineEvent {
  id: string;
  label: string;
  at?: string;
  tone?: "default" | "warning" | "success";
}

export interface InteractionLog {
  learnerId: string;
  events: TimelineEvent[];
}

export interface ClassAiInsight {
  id: string;
  title: string;
  body: string;
  confidence: "High" | "Medium" | string;
}

export interface RubricRow {
  criterion: string;
  rating: RubricRating;
}

export interface ResearchMappingRow {
  publicDatasetField: string;
  futureThingLinkField: string;
  note?: string;
}

export interface ResearchPipelineStep {
  id: string;
  title: string;
  description: string;
}

export interface FutureThingLinkField {
  id: string;
  label: string;
  description: string;
}

export interface ReportSummary {
  title: string;
  scenarioName: string;
  learnerCount: number;
  classSummary: string;
  atRiskLearners: string[];
  misconceptions: string[];
  recommendedActions: string[];
}

/** Row from dialogueInsights.json (ML pipeline). */
export interface DialogueInsight {
  conversationId: string;
  learnerId: string;
  reflectionQuality: string;
  reasoningDepth: string;
  confusionDetected: boolean;
  aiReasoningSummary: string;
  misconception: string;
  teacherFeedbackSuggestion: string;
  confidence: number;
  topic?: string;
  labelDisclaimer?: string;
}

/** Row from learnerRiskPredictions.json (ML pipeline). */
export interface LearnerRiskPrediction {
  learnerId: string;
  sourceStudentId: string;
  riskScore: number;
  riskLevel: string;
  predictedOutcome: string;
  keyFactors: string[];
  teacherRecommendation: string;
}

export interface CompetenceTrendPoint {
  date: string;
  score: number;
}

export interface CompletionSlice {
  name: string;
  value: number;
  color: string;
}

export interface HotspotBarItem {
  id: string;
  label: string;
  percent: number;
}

export interface EngagementSlice {
  label: string;
  percent: number;
  color: string;
}

/** Aggregated scenario analytics bundle from scenarioAnalytics.json (+ fallbacks). */
export interface ScenarioAnalyticsBundle {
  scenarioInteractionEvents: TimelineEvent[];
  learningPathway: string;
  hotspotCompletion: HotspotBarItem[];
  engagementDistribution: EngagementSlice[];
  competenceTrend: CompetenceTrendPoint[];
  completionDonut: CompletionSlice[];
  keyInsight: string;
  kpi: {
    avgScorePct: number;
    learnersAtRiskCount: number;
    /** Counts from full learnerRiskPredictions.json when present */
    predictionAtRiskCount?: number;
    predictionNeedsFeedbackCount?: number;
    predictionStrongCount?: number;
    avgEngagementMin: number;
    reflectionLabel: string;
    reflectionSubtitle?: string;
    cohortSampleNote?: string;
  };
  mappingNote?: string;
}

/** Provenance for UI badges (tooltips / transparency). */
export type DataProvenanceKind =
  | "ml_pipeline"
  | "mock_fallback"
  | "learner_demo"
  | "heuristic_label"
  | "teacher_reviewed";

export type ThingLinkPathStep = "Observe" | "Decide" | "Justify" | "Reflect" | "Review";

export type ThingLinkPilotEventType =
  | "session_start"
  | "hotspot_click"
  | "path_step"
  | "branch_choice"
  | "quiz_response"
  | "reflection_submit"
  | "teacher_label"
  | "session_end";

/** Anonymised ThingLink-style pilot event for future validation. No direct identifiers. */
export interface ThingLinkPilotEvent {
  sessionId: string;
  learnerPseudonym: string;
  scenarioId: string;
  eventType: ThingLinkPilotEventType;
  timestamp: string;
  pathStep?: ThingLinkPathStep;
  hotspotId?: string;
  branchChoice?: string;
  quizResponse?: string;
  reflectionText?: string;
  teacherLabel?: "feedbackNeeded" | "onTrack" | "strongEvidence" | string;
  dwellMs?: number;
  deviceMode?: "desktop" | "mobile" | "tablet" | "vr" | "immersive-room" | string;
  xapiVerb?: string;
  ltiContextId?: string;
}

export interface ThingLinkPilotImportSummary {
  importedAt: string;
  source: "thinglink_pilot_export" | "demo_template" | "manual_json";
  acceptedEvents: number;
  rejectedEvents: number;
  errors: string[];
}

export interface LearningEnvironmentModelTarget {
  id:
    | "feedbackNeeded"
    | "engagementPattern"
    | "reflectionQuality"
    | "reasoningDepth"
    | "competenceEvidenceLevel"
    | "suggestedTeacherAction";
  label: string;
  description: string;
  evidenceInputs: string[];
}

export interface ModelEvaluationSummary {
  dataSource: "public_baseline" | "thinglink_pilot" | "not_available";
  sampleSize: number;
  mode: "baseline" | "small_data_rule_based" | "trained_pilot_model";
  macroF1?: number;
  feedbackNeededRecall?: number;
  calibrationBrier?: number;
  teacherAgreement?: number;
  limitation: string;
}

export interface AiAnalysisBundle {
  learnerId: string;
  riskIndicator: LearnerStatus;
  prototypeConfidence: number;
  reflectionQuality: string;
  reasoningDepth: string;
  detectedLearningDifficulty: string;
  suggestedTeacherAction: string;
  evidenceLines: string[];
  sourceFiles: string[];
  methodNote: string;
}

/** Persisted teacher actions after AI analysis (browser demo). */
export type TeacherDecisionStatus =
  | "accepted_ai_suggestion"
  | "edited_feedback"
  | "follow_up_required"
  | "resubmission_requested"
  | "reviewed"
  | "teacher_override"
  | "feedback_sent";

export type LearnerWorkflowPersisted = {
  aiAnalysisComplete: boolean;
  aiResultBundle?: AiAnalysisBundle;
  aiAnalyzedAt?: string;
  teacherDecision?: {
    status: TeacherDecisionStatus;
    note: string;
    decidedAt: string;
  };
};
