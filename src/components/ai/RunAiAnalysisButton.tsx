"use client";

import { useCallback, useEffect, useState } from "react";
import { buildAiAnalysisBundle } from "@/lib/ai/buildAiAnalysis";
import { getDataProvenance } from "@/lib/ai/provenance";
import { AIEvidenceCard } from "@/components/ai/AIEvidenceCard";
import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import { readLearnerDemoState } from "@/lib/learnerDemo/storage";
import { persistAiAnalysisResult } from "@/lib/workflow/teacherWorkflowStorage";
import type { AiAnalysisBundle, DialogueInsight, InteractionLog, Learner, LearnerRiskPrediction } from "@/lib/types";
import { cn } from "@/lib/utils";

type RunAiAnalysisButtonProps = {
  learner: Learner;
  dialogue: DialogueInsight | null;
  risk: LearnerRiskPrediction | null;
  log: InteractionLog | null;
  usingGeneratedJson: boolean;
  className?: string;
  initialBundle?: AiAnalysisBundle | null;
  onComplete?: (bundle: AiAnalysisBundle) => void;
};

export function RunAiAnalysisButton({
  learner,
  dialogue,
  risk,
  log,
  usingGeneratedJson,
  className,
  initialBundle = null,
  onComplete,
}: RunAiAnalysisButtonProps) {
  const [busy, setBusy] = useState(false);
  const [bundle, setBundle] = useState<AiAnalysisBundle | null>(initialBundle);

  useEffect(() => {
    if (initialBundle != null) setBundle(initialBundle);
  }, [initialBundle]);

  const run = useCallback(() => {
    setBusy(true);
    window.setTimeout(() => {
      const demo = readLearnerDemoState();
      const isDemoLearner = learner.id === DEMO_MOBILE_LEARNER_ID;
      const hasDemo = Boolean(demo?.submittedAt && isDemoLearner);
      const b = buildAiAnalysisBundle({
        learner,
        dialogue,
        risk,
        log,
        demoJustification: hasDemo ? demo!.justification : undefined,
        demoReflection: hasDemo ? demo!.reflection : undefined,
        demoMcLabel: hasDemo ? demo!.selectedAction : undefined,
        demoHotspotClicked: hasDemo ? "Hazard" : undefined,
        demoTimeSpentSec: hasDemo ? demo!.timeSpentSec : undefined,
        demoEventCount: hasDemo ? demo!.events.length : undefined,
        usingGeneratedJson,
      });
      setBundle(b);
      persistAiAnalysisResult(learner.id, b);
      onComplete?.(b);
      setBusy(false);
    }, 1600);
  }, [learner, dialogue, risk, log, usingGeneratedJson, onComplete]);

  const provenBy = getDataProvenance("ai_result", {
    usingGeneratedJson,
    hasLearnerDemo: Boolean(readLearnerDemoState()?.submittedAt && learner.id === DEMO_MOBILE_LEARNER_ID),
    isHeuristic: Boolean(dialogue),
  });

  return (
    <div className={cn("space-y-4", className)}>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Analyzing…" : "Run AI Analysis"}
      </button>

      {busy ? (
        <p className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-950">
          Analyzing learner actions, interaction trace, and reflection…
        </p>
      ) : null}

      {bundle ? (
        <div className="space-y-3">
          <AIEvidenceCard bundle={bundle} provenance={provenBy} />
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Prototype confidence: <strong>{bundle.prototypeConfidence}</strong> (scaled 0–1 · not a reliability
            guarantee)
          </div>
        </div>
      ) : null}
    </div>
  );
}
