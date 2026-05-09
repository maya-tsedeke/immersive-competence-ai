import { ReportsClient } from "@/app/(main)/reports/ReportsClient";
import { getDialogueInsights, getPredictionCohortCounts, getReportSummary, usingGeneratedData } from "@/lib/dataset";

export default function ReportsPage() {
  const report = getReportSummary();
  const preds = getPredictionCohortCounts();
  const dialogue = getDialogueInsights();
  const commonDifficulty =
    dialogue.find((d) => d.misconception?.trim())?.misconception ??
    "Possible difficulty justifying why a selected control action reduces risk (prototype heuristic).";
  const sampleTeacherAction =
    dialogue.find((d) => d.teacherFeedbackSuggestion)?.teacherFeedbackSuggestion ??
    "Ask the learner to compare two safety actions and cite evidence from the scenario.";

  return (
    <ReportsClient
      report={report}
      analyzedCount={preds.total || report.learnerCount}
      atRisk={preds.atRisk}
      needsFeedback={preds.needsFeedback}
      strong={preds.strong}
      commonDifficulty={commonDifficulty}
      sampleTeacherAction={sampleTeacherAction}
      usingGeneratedJson={usingGeneratedData()}
    />
  );
}
