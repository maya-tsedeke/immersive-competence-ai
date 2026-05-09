import type { Learner } from "@/lib/types";
import type { TeacherDecisionStatus } from "@/lib/types";
import { getDemoLearner, listDemoLearnerRecords, type DemoLearnerRecord } from "@/lib/learnerDemo/demoLearnersStore";
import { getLearnerWorkflowState } from "@/lib/workflow/teacherWorkflowStorage";

function teacherDecisionLabel(td?: TeacherDecisionStatus): string {
  if (!td) return "Not reviewed";
  const m: Record<TeacherDecisionStatus, string> = {
    accepted_ai_suggestion: "Reviewed",
    edited_feedback: "Feedback sent",
    follow_up_required: "Follow-up required",
    resubmission_requested: "Resubmission requested",
    reviewed: "Reviewed",
    teacher_override: "Teacher overrode AI",
    feedback_sent: "Feedback sent",
  };
  return m[td];
}

function learningActivityStatusText(record: DemoLearnerRecord, wf: ReturnType<typeof getLearnerWorkflowState>): string {
  const td = wf.teacherDecision?.status;
  if (td === "accepted_ai_suggestion" || td === "reviewed") return "Reviewed";
  if (td === "edited_feedback" || td === "feedback_sent") return "Improving";
  if (td === "follow_up_required") return "Needs feedback";
  if (td === "resubmission_requested") return "Resubmission required";
  if (td === "teacher_override") return "Teacher reviewed";

  const last = record.attempts.length ? record.attempts[record.attempts.length - 1] : null;
  const submitted = Boolean(last?.submittedAt);
  if (!submitted) {
    if (record.learningStatus === "not_started" || record.progressPct <= 0) return "Not started";
    return "In progress";
  }
  if (!wf.aiAnalysisComplete) return "Submitted";
  return "Submitted";
}

function computeDemoActionRequired(record: DemoLearnerRecord, wf: ReturnType<typeof getLearnerWorkflowState>): string {
  const last = record.attempts.length ? record.attempts[record.attempts.length - 1] : null;
  const submitted = Boolean(last?.submittedAt);
  if (!submitted) return "Start scenario";
  if (!wf.aiAnalysisComplete) return "Run AI analysis";
  if (!wf.teacherDecision) return "Teacher review";
  const td = wf.teacherDecision.status;
  if (td === "resubmission_requested") return "Learner resubmit";
  if (td === "follow_up_required") return "Follow-up with learner";
  if (td === "edited_feedback" || td === "feedback_sent") return "Learner improvement";
  return "—";
}

function demoRecordToLearner(record: DemoLearnerRecord): Learner {
  const last = record.attempts.length ? record.attempts[record.attempts.length - 1] : null;
  const submitted = Boolean(last?.submittedAt);
  const wf = getLearnerWorkflowState(record.id);
  const aiDone = wf.aiAnalysisComplete;
  const bundle = wf.aiResultBundle;

  let score = submitted ? 72 : 0;
  if (last?.wrongActionChoice) score = 52;
  if (last?.skippedSteps) score = 38;
  if (last && !last.wrongActionChoice && !last.shortJustification && submitted) score = 88;

  const demoLearningActivityStatus = learningActivityStatusText(record, wf);
  let displayStatus: Learner["status"] = "Strong";
  if (!submitted) {
    displayStatus = "Strong";
  } else if (last?.skippedSteps) {
    displayStatus = "At risk";
  } else if (last?.wrongActionChoice || last?.shortJustification) {
    displayStatus = "Needs feedback";
  } else {
    displayStatus = "Strong";
  }
  if (record.learningStatus === "needs_feedback" || record.learningStatus === "resubmission_required") {
    displayStatus = "Needs feedback";
  }
  if (record.learningStatus === "improving") displayStatus = "Needs feedback";

  const demoAiAnalysisLabel = !submitted ? "Not run" : aiDone ? "Completed" : "Pending run";
  const demoAiResultLabel = bundle ? String(bundle.riskIndicator) : "—";
  const demoAiConfidence = bundle ? bundle.prototypeConfidence : undefined;
  const demoTeacherDecisionLabel = teacherDecisionLabel(wf.teacherDecision?.status);
  const demoActionRequired = computeDemoActionRequired(record, wf);

  const base: Learner = {
    id: record.id,
    score: submitted ? score : Math.round(record.progressPct * 0.72),
    engagement: submitted ? "Medium" : "Low",
    reflection: submitted ? (last && last.reflection.trim().length > 80 ? "High" : "Medium") : "Low",
    status: displayStatus,
    displayStatus,
    completedAt: last?.submittedAt ? new Date(last.submittedAt).toLocaleDateString() : undefined,
    timeSpentMin: last ? Math.round((last.timeSpentSec / 60) * 10) / 10 : undefined,
    riskScore: submitted ? 0.48 : 0.25,
    isLocalDemo: true,
    scenarioTitle: record.scenarioTitle,
    demoDisplayName: record.displayName,
    demoProgressPct: submitted ? 100 : record.progressPct,
    demoLearningStatusLabel: record.learningStatus,
    demoLearningActivityStatus,
    demoAiAnalysisLabel,
    demoAiResultLabel,
    demoAiConfidence,
    demoTeacherDecisionLabel,
    demoActionRequired,
  };
  return base;
}

/** Merge ML/mock cohort with browser demo learners; demo rows first. */
export function mergeDemoLearnersIntoCohort(base: Learner[]): Learner[] {
  if (typeof window === "undefined") return base;
  const demos = listDemoLearnerRecords();
  const demoRows = demos.map(demoRecordToLearner);
  const demoIds = new Set(demoRows.map((d) => d.id));
  const rest = base.filter((l) => !demoIds.has(l.id));
  return [...demoRows, ...rest];
}

export function getMergedLearnerById(id: string, base: Learner[]): Learner | undefined {
  if (typeof window === "undefined") return base.find((l) => l.id === id);
  const rec = getDemoLearner(id);
  if (rec) return demoRecordToLearner(rec);
  return base.find((l) => l.id === id);
}

/** Build a learner row from demo store only (client). */
export function demoLearnerRowFromStore(id: string): Learner | null {
  if (typeof window === "undefined") return null;
  const rec = getDemoLearner(id);
  return rec ? demoRecordToLearner(rec) : null;
}
