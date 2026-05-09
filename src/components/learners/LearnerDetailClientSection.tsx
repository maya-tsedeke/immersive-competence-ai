"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DialogueInsight, InteractionLog, Learner, LearnerRiskPrediction } from "@/lib/types";
import { LearnerDetailHeader } from "@/components/learners/LearnerDetailHeader";
import { LearnerAiPanel } from "@/components/learners/LearnerAiPanel";
import { DemoAttemptHistory } from "@/components/learners/DemoAttemptHistory";
import { DEMO_LEARNERS_CHANGE_EVENT } from "@/lib/learnerDemo/demoLearnersStore";
import { getMergedLearnerById } from "@/lib/learnerDemo/mergeCohort";
import { WORKFLOW_CHANGE_EVENT } from "@/lib/workflow/teacherWorkflowStorage";

export function LearnerDetailClientSection({
  id,
  initialLearner,
  baseCohort,
  dialogue,
  risk,
  log,
  usingGeneratedJson,
  teacherSuggestionFallback,
}: {
  id: string;
  initialLearner: Learner;
  baseCohort: Learner[];
  dialogue: DialogueInsight | null;
  risk: LearnerRiskPrediction | null;
  log: InteractionLog | null;
  usingGeneratedJson: boolean;
  teacherSuggestionFallback: string;
}) {
  const [bump, setBump] = useState(0);
  const refresh = useCallback(() => setBump((n) => n + 1), []);

  useEffect(() => {
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    window.addEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
      window.removeEventListener("storage", h);
    };
  }, [refresh]);

  const mergedLearner = useMemo(() => {
    void bump;
    return getMergedLearnerById(id, baseCohort) ?? initialLearner;
  }, [id, baseCohort, initialLearner, bump]);

  return (
    <>
      <LearnerDetailHeader learner={mergedLearner} />
      {mergedLearner.isLocalDemo ? <DemoAttemptHistory learnerId={id} /> : null}
      <LearnerAiPanel
        learner={mergedLearner}
        dialogue={dialogue}
        risk={risk}
        log={log}
        usingGeneratedJson={usingGeneratedJson}
        teacherSuggestionFallback={teacherSuggestionFallback}
      />
    </>
  );
}
