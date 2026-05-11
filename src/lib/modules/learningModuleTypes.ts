/** Learning module + public-dataset-inspired row shapes (research prototype). */

export type ScenarioTypeId =
  | "workplace_safety"
  | "laboratory_safety"
  | "clinical_training"
  | "forest_field"
  | "classroom_simulation";

export type DatasetProfileId = "oulad_like" | "dialogue_like" | "combined";

export interface LearningAnalyticsRecord {
  learnerId: string;
  moduleId: string;
  moduleTitle: string;
  scenarioId: string;
  totalLearningInteractions: number;
  activeLearningDays: number;
  firstActivityDate: string;
  lastActivityDate: string;
  averageInteractionsPerActiveDay: number;
  assessmentSubmittedCount: number;
  averageAssessmentScore: number;
  weightedAssessmentScore: number;
  early25Interactions: number;
  early50Interactions: number;
  early75Interactions: number;
  finalLearningOutcome: "Pass" | "Withdrawn" | "In progress" | "Unknown";
  learnerRiskStatus: "Low" | "Medium" | "High";
}

export interface DialogueReflectionRecord {
  learnerId: string;
  moduleId: string;
  conversationId: string;
  numberOfDialogueTurns: number;
  averageLearnerResponseLength: number;
  learnerQuestionCount: number;
  uncertaintyIndicators: number;
  reasoningIndicators: number;
  reflectionIndicators: number;
  reflectionQuality: "Low" | "Medium" | "High";
  detectedLearningDifficulty: string;
  reasoningDepth: "Early" | "Developing" | "Proficient";
  teacherFeedbackNeed: "Low" | "Medium" | "High";
}

export interface LearningModule {
  id: string;
  title: string;
  scenarioType: ScenarioTypeId;
  learningObjective: string;
  competenceCriteria: string;
  datasetTemplate: string;
  datasetProfile: DatasetProfileId;
  simulatedLearnerCount: number;
  createdAt: string;
  updatedAt: string;
  /** Synthetic rows generated at module creation (OULAD-inspired). */
  learningAnalyticsPreview: LearningAnalyticsRecord[];
  /** Synthetic dialogue-inspired rows. */
  dialogueReflectionPreview: DialogueReflectionRecord[];
}

export const SCENARIO_TYPE_LABELS: Record<ScenarioTypeId, string> = {
  workplace_safety: "Workplace Safety",
  laboratory_safety: "Laboratory Safety",
  clinical_training: "Clinical Training",
  forest_field: "Forest Field Learning",
  classroom_simulation: "Classroom Simulation",
};

export const DATASET_PROFILE_LABELS: Record<DatasetProfileId, string> = {
  oulad_like: "OULAD-like learning analytics",
  dialogue_like: "Education Dialogue-like reflections",
  combined: "Combined scenario-based profile",
};
