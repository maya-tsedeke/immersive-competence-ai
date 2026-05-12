"use client";

import { useCallback, useEffect, useState } from "react";
import { buildAiAnalysisBundle } from "@/lib/ai/buildAiAnalysis";
import { buildDemoScenarioAiBundle } from "@/lib/ai/demoScenarioAi";
import { getDataProvenance } from "@/lib/ai/provenance";
import { AIEvidenceCard } from "@/components/ai/AIEvidenceCard";
import { appendDemoActivity, getDemoLearner } from "@/lib/learnerDemo/demoLearnersStore";
import { learnerDemoSubmitted, readLearnerDemoState } from "@/lib/learnerDemo/storage";
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
    const rec = getDemoLearner(learner.id);
    const lastAttempt = rec?.attempts?.length ? rec.attempts[rec.attempts.length - 1] : null;

    if (learner.isLocalDemo && (!rec || !lastAttempt?.submittedAt)) {
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      let b: AiAnalysisBundle;

      if (learner.isLocalDemo && lastAttempt && rec) {
        b = buildDemoScenarioAiBundle(learner, lastAttempt);
        appendDemoActivity(learner.id, `Teacher ran AI analysis`);
      } else {
        const demo = readLearnerDemoState();
        const hasLegacyDemo = Boolean(demo?.submittedAt && demo.learnerId === learner.id);
        b = buildAiAnalysisBundle({
          learner,
          dialogue,
          risk,
          log,
          demoJustification: hasLegacyDemo ? demo!.justification : undefined,
          demoReflection: hasLegacyDemo ? demo!.reflection : undefined,
          demoMcLabel: hasLegacyDemo ? demo!.selectedAction : undefined,
          demoHotspotClicked: hasLegacyDemo ? "Hazard" : undefined,
          demoTimeSpentSec: hasLegacyDemo ? demo!.timeSpentSec : undefined,
          demoEventCount: hasLegacyDemo ? demo!.events.length : undefined,
          usingGeneratedJson,
        });
      }

      setBundle(b);
      persistAiAnalysisResult(learner.id, b);
      onComplete?.(b);
      setBusy(false);
    }, 1600);
  }, [learner, dialogue, risk, log, usingGeneratedJson, onComplete]);

  const provenBy = getDataProvenance("ai_result", {
    usingGeneratedJson,
    hasLearnerDemo: learner.isLocalDemo && learnerDemoSubmitted(learner.id),
    isHeuristic: Boolean(dialogue),
  });

  const rec = typeof window !== "undefined" ? getDemoLearner(learner.id) : null;
  const lastAttempt = rec?.attempts?.length ? rec.attempts[rec.attempts.length - 1] : null;
  const demoBlocked = Boolean(learner.isLocalDemo && (!rec || !lastAttempt?.submittedAt));

  return (
    <div className={cn("space-y-4", className)}>
      <button
        type="button"
        onClick={run}
        disabled={busy || demoBlocked}
        className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Analyzing…" : "Run AI Analysis"}
      </button>

      {demoBlocked ? (
        <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          Submit scenario evidence for <strong>{learner.id}</strong> first — then run AI analysis for that learner.
        </p>
      ) : null}

      {busy ? (
        <p className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-950">
          Analyzing learner actions, interaction trace, and reflection…
        </p>
      ) : null}

      {bundle ? (
        <div className="space-y-3">
          <AIEvidenceCard bundle={bundle} provenance={provenBy} />
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Prototype confidence: <strong>{bundle.prototypeConfidence}</strong> (0–1 · strength of heuristic signal, not
            the header competence % and not a reliability guarantee).
          </div>
        </div>
      ) : null}
    </div>
  );
}
