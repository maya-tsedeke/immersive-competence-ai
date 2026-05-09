"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Learner } from "@/lib/types";
import { StatusBadge } from "@/components/learners/StatusBadge";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";
import { getDataProvenance } from "@/lib/ai/provenance";
import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import { readLearnerDemoState } from "@/lib/learnerDemo/storage";
import { WORKFLOW_CHANGE_EVENT, getLearnerWorkflowState } from "@/lib/workflow/teacherWorkflowStorage";

function aiStatusLabel(learnerId: string, tick: number): string {
  void tick;
  if (learnerId !== DEMO_MOBILE_LEARNER_ID) return "—";
  const d = readLearnerDemoState();
  if (!d?.submittedAt) return "Awaiting submission";
  const w = getLearnerWorkflowState(learnerId);
  if (!w.aiAnalysisComplete) return "Pending run";
  return "Complete";
}

function teacherStatusLabel(learnerId: string, tick: number): string {
  void tick;
  if (learnerId !== DEMO_MOBILE_LEARNER_ID) return "—";
  const d = readLearnerDemoState();
  const w = getLearnerWorkflowState(learnerId);
  if (!d?.submittedAt) return "—";
  if (!w.aiAnalysisComplete) return "Awaiting AI";
  if (!w.teacherDecision) return "Pending";
  return "Saved";
}

export function LearnerCard({ learner, usingGeneratedJson }: { learner: Learner; usingGeneratedJson: boolean }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (learner.id !== DEMO_MOBILE_LEARNER_ID) return;
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    window.addEventListener("storage", h);
    const t = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener("storage", h);
      window.clearInterval(t);
    };
  }, [learner.id, refresh]);

  const prov = getDataProvenance("learner_row", {
    usingGeneratedJson,
    hasLearnerDemo: learner.id === DEMO_MOBILE_LEARNER_ID,
    isHeuristic: false,
  });
  return (
    <Link
      href={`/learners/${learner.id}`}
      className="block rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Learner
          </p>
          <p className="text-lg font-semibold text-slate-900">{learner.id}</p>
        </div>
        <StatusBadge status={learner.displayStatus ?? learner.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[var(--muted)]">Score</dt>
          <dd className="font-semibold text-slate-900">{learner.score}%</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Engagement</dt>
          <dd className="font-semibold text-slate-900">{learner.engagement}</dd>
        </div>
        {learner.riskScore != null ? (
          <div className="col-span-2">
            <dt className="text-[var(--muted)]">Risk score (model)</dt>
            <dd className="font-semibold text-slate-900">{learner.riskScore.toFixed(4)}</dd>
          </div>
        ) : null}
        <div className="col-span-2">
          <dt className="text-[var(--muted)]">AI analysis</dt>
          <dd className="font-semibold text-slate-900">{aiStatusLabel(learner.id, tick)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--muted)]">Teacher decision</dt>
          <dd className="font-semibold text-slate-900">{teacherStatusLabel(learner.id, tick)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--muted)]">Reflection</dt>
          <dd className="font-semibold text-slate-900">{learner.reflection}</dd>
        </div>
        <div className="col-span-2 mt-1 flex flex-wrap gap-2">
          <ProvenanceBadge kind={prov} compact />
        </div>
      </dl>
    </Link>
  );
}
