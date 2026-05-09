"use client";

import { useCallback, useEffect, useState } from "react";
import { DEMO_LEARNERS_CHANGE_EVENT, getDemoLearner } from "@/lib/learnerDemo/demoLearnersStore";
import { WORKFLOW_CHANGE_EVENT, getLearnerWorkflowState } from "@/lib/workflow/teacherWorkflowStorage";

export function DemoAttemptHistory({ learnerId }: { learnerId: string }) {
  const [, bump] = useState(0);
  const refresh = useCallback(() => bump((n) => n + 1), []);

  useEffect(() => {
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    window.addEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
    return () => {
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
    };
  }, [refresh]);

  const rec = typeof window === "undefined" ? null : getDemoLearner(learnerId);
  const wf = typeof window === "undefined" ? null : getLearnerWorkflowState(learnerId);

  if (!rec?.attempts.length) return null;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <h2 className="text-sm font-semibold text-slate-900">Attempt history (demo)</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Each resubmission adds an attempt. The panel below shows the latest AI analysis after you re-run it.
      </p>
      <ul className="mt-4 space-y-3 text-sm">
        {rec.attempts.map((a) => (
          <li
            key={a.attemptNumber}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 ring-1 ring-slate-100"
          >
            <p className="font-semibold text-slate-900">
              Attempt {a.attemptNumber}{" "}
              <span className="font-normal text-slate-600">
                · {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "—"}
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-700">
              Action: {a.selectedAction || "—"} · Skipped steps: {a.skippedSteps ? "yes" : "no"} · Wrong action:{" "}
              {a.wrongActionChoice ? "yes" : "no"} · Short justification: {a.shortJustification ? "yes" : "no"}
            </p>
          </li>
        ))}
      </ul>
      {wf?.aiResultBundle ? (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-950">
          <p className="font-semibold">Current AI result (last run)</p>
          <p className="mt-1">
            Risk: <strong>{wf.aiResultBundle.riskIndicator}</strong> · Confidence:{" "}
            <strong>{wf.aiResultBundle.prototypeConfidence}</strong>
          </p>
          {wf.teacherDecision?.note ? (
            <p className="mt-2 text-indigo-900/90">
              <strong>Teacher feedback:</strong> {wf.teacherDecision.note}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
