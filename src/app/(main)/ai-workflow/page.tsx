import { AiWorkflowClient } from "@/app/(main)/ai-workflow/AiWorkflowClient";
import {
  getDialogueInsightForLearner,
  getLearnerById,
  getRiskPredictionForLearner,
  usingGeneratedData,
} from "@/lib/dataset";
import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import type { Learner } from "@/lib/types";

function fallbackDemoLearner(): Learner {
  return {
    id: DEMO_MOBILE_LEARNER_ID,
    score: 64,
    engagement: "Medium",
    reflection: "Medium",
    status: "Needs feedback",
    displayStatus: "Needs feedback",
    timeSpentMin: 8,
    riskScore: 0.48,
  };
}

export default function AiWorkflowPage() {
  const learner = getLearnerById(DEMO_MOBILE_LEARNER_ID) ?? fallbackDemoLearner();
  const dialogue = getDialogueInsightForLearner(DEMO_MOBILE_LEARNER_ID) ?? null;
  const risk = getRiskPredictionForLearner(DEMO_MOBILE_LEARNER_ID) ?? null;

  return (
    <AiWorkflowClient
      demoLearner={learner}
      dialogue={dialogue}
      risk={risk}
      usingGeneratedJson={usingGeneratedData()}
    />
  );
}
