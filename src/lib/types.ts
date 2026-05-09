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
  | "reviewed";

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
