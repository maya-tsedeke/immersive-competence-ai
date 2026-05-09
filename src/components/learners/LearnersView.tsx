"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EngagementLevel, Learner, LearnerStatus } from "@/lib/types";
import { LearnerCard } from "@/components/learners/LearnerCard";
import { LearnerTable } from "@/components/learners/LearnerTable";
import { learnerDemoSubmitted } from "@/lib/learnerDemo/storage";
import { WORKFLOW_CHANGE_EVENT, getLearnerWorkflowState } from "@/lib/workflow/teacherWorkflowStorage";
import { mergeDemoLearnersIntoCohort } from "@/lib/learnerDemo/mergeCohort";
import { DEMO_LEARNERS_CHANGE_EVENT } from "@/lib/learnerDemo/demoLearnersStore";
import { AddLearnerActivityButton } from "@/components/learners/AddLearnerActivityModal";
import { cn } from "@/lib/utils";

export type PredictionCohortCounts = {
  total: number;
  atRisk: number;
  needsFeedback: number;
  strong: number;
};

type ChipId =
  | "all"
  | LearnerStatus
  | "high_engagement"
  | "low_engagement"
  | "waiting_ai"
  | "teacher_reviewed";

type SortId = "risk" | "competence" | "engagement_low" | "recent";

const sortOptions: Array<{ id: SortId; label: string }> = [
  { id: "risk", label: "Highest risk" },
  { id: "competence", label: "Highest competence" },
  { id: "engagement_low", label: "Lowest engagement" },
  { id: "recent", label: "Recently completed" },
];

function engagementRank(e: EngagementLevel): number {
  if (e === "High") return 3;
  if (e === "Medium") return 2;
  return 1;
}

function rowStatus(l: Learner): LearnerStatus {
  return l.displayStatus ?? l.status;
}

function riskRank(l: Learner): number {
  if (l.riskScore != null) return l.riskScore;
  const s = rowStatus(l);
  if (s === "At risk") return 0.9;
  if (s === "Needs feedback") return 0.5;
  return 0.15;
}

function parseCompletedDay(completedAt?: string): number {
  if (!completedAt) return -1;
  const m = completedAt.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : -1;
}

export function LearnersView({
  learners,
  cohortCounts,
  usingGeneratedJson,
}: {
  learners: Learner[];
  cohortCounts: PredictionCohortCounts;
  usingGeneratedJson: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChipId>("all");
  const [sort, setSort] = useState<SortId>("risk");
  const [wfTick, setWfTick] = useState(0);

  const refreshWf = useCallback(() => setWfTick((n) => n + 1), []);

  useEffect(() => {
    const t = window.setInterval(refreshWf, 1300);
    const h = () => refreshWf();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    window.addEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
    window.addEventListener("storage", h);
    return () => {
      window.clearInterval(t);
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
      window.removeEventListener("storage", h);
    };
  }, [refreshWf]);

  const mergedLearners = useMemo(() => {
    void wfTick;
    return mergeDemoLearnersIntoCohort(learners);
  }, [learners, wfTick]);

  const chipLabels = useMemo(() => {
    const countLocal = (s: LearnerStatus) => mergedLearners.filter((l) => rowStatus(l) === s).length;
    const all = mergedLearners.length;
    const atRisk = cohortCounts.total > 0 ? cohortCounts.atRisk : countLocal("At risk");
    const needs = cohortCounts.total > 0 ? cohortCounts.needsFeedback : countLocal("Needs feedback");
    const strong = cohortCounts.total > 0 ? cohortCounts.strong : countLocal("Strong");
    const waitingAi = mergedLearners.filter((l) => {
      if (!l.isLocalDemo) return false;
      const w = getLearnerWorkflowState(l.id);
      return learnerDemoSubmitted(l.id) && !w.aiAnalysisComplete;
    }).length;
    const teacherRev = mergedLearners.filter((l) => {
      if (!l.isLocalDemo) return false;
      if (!learnerDemoSubmitted(l.id)) return false;
      return Boolean(getLearnerWorkflowState(l.id).teacherDecision);
    }).length;
    return {
      all: `All (${all})`,
      atRisk: `At risk (${atRisk})`,
      needs: `Needs feedback (${needs})`,
      strong: `Strong (${strong})`,
      waitingAi: `Waiting for AI (${waitingAi})`,
      teacherReviewed: `Teacher reviewed (${teacherRev})`,
      topNote:
        cohortCounts.total > 0
          ? "Filter counts use full learnerRiskPredictions.json where available."
          : "Filter counts use visible learner rows (mock or dashboard list).",
    };
  }, [mergedLearners, cohortCounts]);

  const filtered = useMemo(() => {
    let rows = mergedLearners.filter((l) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || l.id.toLowerCase().includes(q);
      let matchesChip = true;
      if (filter === "all") matchesChip = true;
      else if (filter === "high_engagement") matchesChip = l.engagement === "High";
      else if (filter === "low_engagement") matchesChip = l.engagement === "Low";
      else if (filter === "waiting_ai") {
        const w = getLearnerWorkflowState(l.id);
        matchesChip = Boolean(l.isLocalDemo && learnerDemoSubmitted(l.id) && !w.aiAnalysisComplete);
      } else if (filter === "teacher_reviewed") {
        matchesChip = Boolean(l.isLocalDemo && learnerDemoSubmitted(l.id) && getLearnerWorkflowState(l.id).teacherDecision);
      } else matchesChip = rowStatus(l) === filter;
      return matchesQuery && matchesChip;
    });

    rows = [...rows].sort((a, b) => {
      if (sort === "risk") return riskRank(b) - riskRank(a);
      if (sort === "competence") return b.score - a.score;
      if (sort === "engagement_low")
        return engagementRank(a.engagement) - engagementRank(b.engagement);
      return parseCompletedDay(b.completedAt) - parseCompletedDay(a.completedAt);
    });

    return rows;
  }, [mergedLearners, query, filter, sort]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Learners</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Cohort performance</h1>
        <p className="mt-2 text-sm text-slate-600">
          Data merges <strong>dashboardLearners.json</strong> with <strong>learnerRiskPredictions.json</strong> when
          both exist. Status chips prioritize threshold-mapped <strong>risk indicators</strong> when predictions exist.
          Teachers remain responsible for interpretation — AI-assisted insight only.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <AddLearnerActivityButton />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <input
          aria-label="Search learners"
          placeholder="Search by learner ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm shadow-sm outline-none ring-indigo-500/0 transition focus:ring-4 min-h-[44px]"
        />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all" as const, label: chipLabels.all },
              { id: "At risk" as const, label: chipLabels.atRisk },
              { id: "Needs feedback" as const, label: chipLabels.needs },
              { id: "Strong" as const, label: chipLabels.strong },
              { id: "waiting_ai" as const, label: chipLabels.waitingAi },
              { id: "teacher_reviewed" as const, label: chipLabels.teacherReviewed },
              { id: "high_engagement" as const, label: "High engagement" },
              { id: "low_engagement" as const, label: "Low engagement" },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                className={cn(
                  "min-h-[40px] rounded-full px-3 py-2 text-xs font-semibold transition",
                  filter === chip.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              className="min-h-[44px] rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-medium text-slate-800"
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <LearnerTable rows={filtered} usingGeneratedJson={usingGeneratedJson} />
      <div className="grid gap-3 md:hidden">
        {filtered.map((learner) => (
          <LearnerCard key={learner.id} learner={learner} usingGeneratedJson={usingGeneratedJson} />
        ))}
      </div>
    </div>
  );
}