"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Learner } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";
import { getDataProvenance } from "@/lib/ai/provenance";
import { DEMO_LEARNERS_CHANGE_EVENT } from "@/lib/learnerDemo/demoLearnersStore";
import { WORKFLOW_CHANGE_EVENT } from "@/lib/workflow/teacherWorkflowStorage";

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
    window.addEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
    window.addEventListener("storage", h);
    const t = window.setInterval(refresh, 1500);
    return () => {
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
      window.removeEventListener("storage", h);
      window.clearInterval(t);
    };
  }, [refresh]);

  return (
    <div className="hidden min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)] md:block">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3">Learner ID</th>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3">Scenario</th>
            <th className="px-4 py-3">Learning status</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">AI analysis</th>
            <th className="px-4 py-3">AI result</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Teacher decision</th>
            <th className="px-4 py-3">Action required</th>
            <th className="px-4 py-3">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const isDemo = Boolean(row.isLocalDemo);
            const prov = getDataProvenance("learner_row", {
              usingGeneratedJson,
              hasLearnerDemo: isDemo,
              isHeuristic: false,
            });
            void tick;
            const scenario = row.scenarioTitle ?? "—";
            const learning = row.demoLearningActivityStatus ?? row.displayStatus ?? row.status;
            const progress = row.demoProgressPct != null ? `${row.demoProgressPct}%` : `${row.score}%`;
            const aiLab = row.demoAiAnalysisLabel ?? "—";
            const aiRes = row.demoAiResultLabel ?? "—";
            const conf =
              row.demoAiConfidence != null ? row.demoAiConfidence.toFixed(2) : row.riskScore != null ? "—" : "—";
            const teacherD = row.demoTeacherDecisionLabel ?? "—";
            const action = row.demoActionRequired ?? "—";

            const modLabel = row.demoModuleTitle ?? row.demoModuleId ?? "—";

            return (
              <tr key={row.id} className="transition hover:bg-slate-50/80">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <Link href={`/learners/${row.id}`} className="font-mono hover:underline">
                    {row.id}
                  </Link>
                </td>
                <td className="max-w-[140px] px-4 py-3 text-xs text-slate-700">
                  {isDemo ? modLabel : "—"}
                </td>
                <td className="max-w-[200px] px-4 py-3 text-slate-700">{scenario}</td>
                <td className="px-4 py-3 text-slate-700">{learning}</td>
                <td className="px-4 py-3 tabular-nums text-slate-700">{progress}</td>
                <td className="px-4 py-3 text-slate-700">{isDemo ? aiLab : "—"}</td>
                <td className="px-4 py-3 text-slate-700">{isDemo ? aiRes : row.displayStatus ?? row.status}</td>
                <td className="px-4 py-3 tabular-nums text-slate-700">
                  {row.demoAiConfidence != null ? conf : row.riskScore != null ? row.riskScore.toFixed(2) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-700">{isDemo ? teacherD : "—"}</td>
                <td className="max-w-[180px] px-4 py-3 text-xs text-slate-700">{isDemo ? action : "—"}</td>
                <td className="px-4 py-3">
                  <ProvenanceBadge kind={prov} compact />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
