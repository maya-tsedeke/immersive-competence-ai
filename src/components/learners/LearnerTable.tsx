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

function pipelineCells(learnerId: string, tick: number): { ai: string; teacher: string } {
  void tick;
  if (learnerId !== DEMO_MOBILE_LEARNER_ID) return { ai: "—", teacher: "—" };
  const d = readLearnerDemoState();
  const w = getLearnerWorkflowState(learnerId);
  const ai = !d?.submittedAt ? "Awaiting submission" : w.aiAnalysisComplete ? "Complete" : "Pending run";
  const teacher = !d?.submittedAt ? "—" : !w.aiAnalysisComplete ? "Awaiting AI" : w.teacherDecision ? "Saved" : "Pending";
  return { ai, teacher };
}

export function LearnerTable({
  rows,
  usingGeneratedJson,
}: {
  rows: Learner[];
  usingGeneratedJson: boolean;
}) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    window.addEventListener("storage", h);
    const t = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener("storage", h);
      window.clearInterval(t);
    };
  }, [refresh]);
  return (
    <div className="hidden min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)] md:block">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3">Learner</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Engagement</th>
            <th className="px-4 py-3">Reflection</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">AI analysis</th>
            <th className="px-4 py-3">Teacher</th>
            <th className="px-4 py-3">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{rows.map((row) => {
            const prov = getDataProvenance("learner_row", {
              usingGeneratedJson,
              hasLearnerDemo: row.id === DEMO_MOBILE_LEARNER_ID,
              isHeuristic: false,
            });
            const { ai, teacher } = pipelineCells(row.id, tick);
            return (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <Link href={`/learners/${row.id}`} className="hover:underline">
                    {row.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-700">{row.score}%</td>
                <td className="px-4 py-3 text-slate-700">
                  {row.riskScore != null ? (
                    <span className="font-medium text-slate-900">{row.riskScore.toFixed(2)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{row.engagement}</td>
                <td className="px-4 py-3 text-slate-700">{row.reflection}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.displayStatus ?? row.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">{ai}</td>
                <td className="px-4 py-3 text-slate-700">{teacher}</td>
                <td className="px-4 py-3">
                  <ProvenanceBadge kind={prov} compact />
                </td>
              </tr>
            );
          })}</tbody>
      </table>
    </div>
  );
}
