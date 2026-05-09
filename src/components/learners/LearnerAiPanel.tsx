"use client";

import { useCallback, useEffect, useState } from "react";
import type { AiAnalysisBundle, DialogueInsight, InteractionLog, Learner, LearnerRiskPrediction } from "@/lib/types";
import { RunAiAnalysisButton } from "@/components/ai/RunAiAnalysisButton";
import { TeacherDecisionCard } from "@/components/ai/TeacherDecisionCard";
import {
  WORKFLOW_CHANGE_EVENT,
  getLearnerWorkflowState,
} from "@/lib/workflow/teacherWorkflowStorage";

export function LearnerAiPanel({
  learner,
  dialogue,
  risk,
  log,
  usingGeneratedJson,
  teacherSuggestionFallback,
}: {
  learner: Learner;
  dialogue: DialogueInsight | null;
  risk: LearnerRiskPrediction | null;
  log: InteractionLog | null;
  usingGeneratedJson: boolean;
  teacherSuggestionFallback: string;
}) {
  const [storedBundle, setStoredBundle] = useState<AiAnalysisBundle | null>(null);

  const refresh = useCallback(() => {
    const w = getLearnerWorkflowState(learner.id);
    setStoredBundle(w.aiResultBundle ?? null);
  }, [learner.id]);

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    return () => window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
  }, [refresh]);

  return (
    <>
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold text-slate-900">AI-detected results</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Run the prototype analysis pipeline to surface risk indicator, reflection quality, reasoning depth, detected
          learning difficulty, and suggested teacher action. Teacher review required.
        </p>
        <div className="mt-4">
          <RunAiAnalysisButton
            learner={learner}
            dialogue={dialogue ?? null}
            risk={risk ?? null}
            log={log}
            usingGeneratedJson={usingGeneratedJson}
            initialBundle={storedBundle}
            onComplete={() => refresh()}
          />
        </div>
      </section>

      <TeacherDecisionCard learnerId={learner.id} suggestedActionFallback={teacherSuggestionFallback} />
    </>
  );
}
