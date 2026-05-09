import type { TeacherDecisionStatus } from "@/lib/types";
import {
  appendDemoActivity,
  getDemoLearner,
  updateDemoLearnerPartial,
  type DemoLearningStatusLabel,
} from "@/lib/learnerDemo/demoLearnersStore";

const toLearningStatus: Record<TeacherDecisionStatus, DemoLearningStatusLabel> = {
  accepted_ai_suggestion: "reviewed",
  reviewed: "reviewed",
  edited_feedback: "improving",
  feedback_sent: "improving",
  follow_up_required: "needs_feedback",
  resubmission_requested: "resubmission_required",
  teacher_override: "teacher_reviewed",
};

const decisionLog: Record<TeacherDecisionStatus, string> = {
  accepted_ai_suggestion: "Teacher accepted AI suggestion",
  reviewed: "Teacher marked as reviewed",
  edited_feedback: "Teacher edited feedback",
  feedback_sent: "Teacher sent feedback",
  follow_up_required: "Teacher marked follow-up required",
  resubmission_requested: "Teacher requested resubmission",
  teacher_override: "Teacher overrode AI suggestion",
};

export function syncDemoLearnerAfterTeacherDecision(learnerId: string, status: TeacherDecisionStatus) {
  if (!getDemoLearner(learnerId)) return;
  updateDemoLearnerPartial(learnerId, { learningStatus: toLearningStatus[status] });
  appendDemoActivity(learnerId, decisionLog[status]);
}
