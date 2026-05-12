/**
 * Types for portable research demo state (export/import).
 * GitHub Pages: persistence is browser storage only — see browserStorage.ts / jsonExport.ts.
 * SQLite / server DB: optional future path — sqliteAdapter.server.ts (not used on static hosting).
 */

import type { DemoLearnerRecord } from "@/lib/learnerDemo/demoLearnersStore";
import type {
  LearnerWorkflowPersisted,
  ModelEvaluationSummary,
  ThingLinkPilotEvent,
  ThingLinkPilotImportSummary,
} from "@/lib/types";
import type { LearningModule } from "@/lib/modules/learningModuleTypes";

/** Full snapshot for “Export Demo JSON” (research evidence bundle). */
export type ResearchDemoExportV1 = {
  version: 1;
  exportedAt: string;
  disclaimer: string;
  modules: LearningModule[];
  demoLearners: Record<string, DemoLearnerRecord>;
  demoActivity: { at: string; learnerId: string; message: string }[];
  teacherWorkflow: Record<string, LearnerWorkflowPersisted>;
  /** Optional anonymised ThingLink-style pilot events for future validation. */
  pilotEvents?: ThingLinkPilotEvent[];
  /** Import history for governed pilot-event bundles. */
  pilotImports?: ThingLinkPilotImportSummary[];
  /** Optional latest model-evaluation snapshot when pilot modelling has run. */
  modelEvaluation?: ModelEvaluationSummary;
  /** Optional raw scratch events if we extend global event log */
  learningEvents?: ResearchLearningEvent[];
};

export type ResearchLearningEvent = {
  id: string;
  learnerId: string;
  moduleId: string;
  scenarioId: string;
  timestamp: string;
  eventType: string;
  step: string;
  hotspot?: string;
  value?: string;
  progressAfterEvent?: number;
};
