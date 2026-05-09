"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Learner } from "@/lib/types";
import { StatusBadge } from "@/components/learners/StatusBadge";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";
import { getDataProvenance } from "@/lib/ai/provenance";
import { DEMO_LEARNERS_CHANGE_EVENT } from "@/lib/learnerDemo/demoLearnersStore";
import { WORKFLOW_CHANGE_EVENT } from "@/lib/workflow/teacherWorkflowStorage";

export function LearnerCard({ learner, usingGeneratedJson }: { learner: Learner; usingGeneratedJson: boolean }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!learner.isLocalDemo) return;
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    window.addEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
    window.addEventListener("storage", h);
    const t = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
      window.removeEventListener("storage", h);
      window.clearInterval(t);
    };
  }, [learner.isLocalDemo, refresh]);

  const prov = getDataProvenance("learner_row", {
    usingGeneratedJson,
    hasLearnerDemo: Boolean(learner.isLocalDemo),
    isHeuristic: false,
  });
  void tick;

  return (
    <Link
      href={`/learners/${learner.id}`}
      className="block rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Learner</p>
          <p className="text-lg font-semibold text-slate-900">{learner.id}</p>
          {learner.scenarioTitle ? (
            <p className="mt-1 text-xs text-slate-600">{learner.scenarioTitle}</p>
          ) : null}
        </div>
        <StatusBadge status={learner.displayStatus ?? learner.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[var(--muted)]">Learning status</dt>
          <dd className="font-semibold text-slate-900">{learner.demoLearningActivityStatus ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Progress</dt>
          <dd className="font-semibold text-slate-900">{learner.demoProgressPct != null ? `${learner.demoProgressPct}%` : `${learner.score}%`}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--muted)]">AI analysis</dt>
          <dd className="font-semibold text-slate-900">{learner.demoAiAnalysisLabel ?? "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--muted)]">AI result</dt>
          <dd className="font-semibold text-slate-900">{learner.demoAiResultLabel ?? "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--muted)]">Teacher decision</dt>
          <dd className="font-semibold text-slate-900">{learner.demoTeacherDecisionLabel ?? "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--muted)]">Action</dt>
          <dd className="text-slate-800">{learner.demoActionRequired ?? "—"}</dd>
        </div>
        {learner.riskScore != null && !learner.isLocalDemo ? (
          <div className="col-span-2">
            <dt className="text-[var(--muted)]">Risk score (model)</dt>
            <dd className="font-semibold text-slate-900">{learner.riskScore.toFixed(4)}</dd>
          </div>
        ) : null}
        <div className="col-span-2 mt-1 flex flex-wrap gap-2">
          <ProvenanceBadge kind={prov} compact />
        </div>
      </dl>
    </Link>
  );
}
