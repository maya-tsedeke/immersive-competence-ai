import { AIInsightsClient } from "@/app/(main)/ai-insights/AIInsightsClient";
import {
  getAiInsights,
  getDialogueInsightForLearner,
  getDialogueInsights,
  getLearners,
  getRiskPredictionForLearner,
  usingGeneratedData,
} from "@/lib/dataset";

export default function AIInsightsPage() {
  const insights = getAiInsights();
  const dialogue = getDialogueInsights();
  const learners = getLearners();
  const sample = learners[0];
  const sampleDialogue = sample ? getDialogueInsightForLearner(sample.id) ?? null : null;
  const sampleRisk = sample ? getRiskPredictionForLearner(sample.id) ?? null : null;

  return (
    <AIInsightsClient
      insights={insights}
      dialogue={dialogue}
      sampleLearner={sample}
      sampleDialogue={sampleDialogue}
      sampleRisk={sampleRisk}
      usingGeneratedJson={usingGeneratedData()}
    />
  );
}
