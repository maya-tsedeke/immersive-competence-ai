"use client";

import { useCallback, useEffect, useState } from "react";
import { DEMO_LEARNERS_CHANGE_EVENT, readDemoActivityLog } from "@/lib/learnerDemo/demoLearnersStore";

export function RecentLearnerActivity() {
  const [, bump] = useState(0);
  const refresh = useCallback(() => bump((n) => n + 1), []);

  useEffect(() => {
    const h = () => refresh();
    window.addEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
    const t = window.setInterval(refresh, 2000);
    return () => {
      window.removeEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
      window.clearInterval(t);
    };
  }, [refresh]);

  const items = readDemoActivityLog().slice(0, 12);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">Recent learner activity</p>
      <p className="mt-1 text-xs text-[var(--muted)]">Live log from browser demo learners in this session.</p>
      <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
        {items.length ? (
          items.map((e, i) => (
            <li key={`${e.at}-${i}`} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
                {new Date(e.at).toLocaleTimeString()}
              </span>
              <span className="text-slate-800">
                <span className="font-mono font-semibold">{e.learnerId}</span> — {e.message}
              </span>
            </li>
          ))
        ) : (
          <li className="text-sm text-slate-600">No activity yet — add a learner or start a scenario.</li>
        )}
      </ul>
    </div>
  );
}
