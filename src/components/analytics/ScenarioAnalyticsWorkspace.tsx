"use client";

import { useMemo, useState } from "react";
import type { EngagementLevel, Learner, LearnerStatus, ScenarioAnalyticsBundle } from "@/lib/types";
import { EngagementDistributionChart } from "@/components/analytics/EngagementDistributionChart";
import { HotspotCompletionBar } from "@/components/analytics/HotspotCompletionBar";
import { InteractionTimeline } from "@/components/analytics/InteractionTimeline";
import { ModelInfoCard } from "@/components/dashboard/ModelInfoCard";
import { XRScenarioViewer } from "@/components/xr/XRScenarioViewer";
import { annotateHotspotCompletionWithPathway } from "@/lib/xr/scenarioHotspots";
import { cn } from "@/lib/utils";

const scenarios = [
  { id: "default", label: "Immersive cohort (JSON / mock)" },
  { id: "learning-environment", label: "Learning environment demo (UX prototype)" },
];

export function ScenarioAnalyticsWorkspace({
  sa,
  learners,
}: {
  sa: ScenarioAnalyticsBundle;
  learners: Learner[];
}) {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [engagement, setEngagement] = useState<"all" | EngagementLevel>("all");
  const [risk, setRisk] = useState<"all" | LearnerStatus | "elevated">("all");

  const atRiskCount = useMemo(() => learners.filter((l) => l.status === "At risk").length, [learners]);
  const needsFb = useMemo(() => learners.filter((l) => l.status === "Needs feedback").length, [learners]);

  const highlightEngagement = engagement === "all" ? null : engagement;

  const insightExtra = useMemo(() => {
    if (risk === "elevated") {
      return ` Prototype filter: ${atRiskCount + needsFb} learners show elevated discussion indicators (at risk + needs feedback).`;
    }
    if (risk !== "all") {
      return ` Prototype filter: ${learners.filter((l) => l.status === risk).length} learners in "${risk}" status.`;
    }
    return "";
  }, [risk, learners, atRiskCount, needsFb]);

  const hotspotWithPathway = useMemo(
    () => annotateHotspotCompletionWithPathway(sa.hotspotCompletion),
    [sa.hotspotCompletion],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Scenario workspace</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Immersive scenario analytics</h1>
        <p className="mt-2 text-sm text-slate-600">
          Hotspot-style progress, pathway, and engagement for the active scenario. Filters highlight cohort segments;
          full segmentation awaits multi-scenario ThingLink exports.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] lg:flex-row lg:flex-wrap lg:items-end">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Scenario</span>
          <select
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-800"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[180px] flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Engagement emphasis
          </span>
          <select
            value={engagement}
            onChange={(e) => setEngagement(e.target.value as typeof engagement)}
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-800"
          >
            <option value="all">All levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
        <label className="flex min-w-[200px] flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Risk emphasis
          </span>
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value as typeof risk)}
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-800"
          >
            <option value="all">All</option>
            <option value="elevated">Elevated (at risk + needs feedback)</option>
            <option value="At risk">At risk</option>
            <option value="Needs feedback">Needs feedback</option>
            <option value="Strong">Strong</option>
          </select>
        </label>
        <p className="text-xs text-[var(--muted)] lg:ml-auto lg:max-w-sm">
          Filters adjust chart emphasis only. Underlying JSON is a single public-dataset cohort.
        </p>
      </div>

      <ModelInfoCard />

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)]">
        <div className="border-b border-[var(--border)] bg-slate-50/90 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">XR-style learner canvas</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Mini immersive preview (hotspot trace demo)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Same panoramic viewer as <strong>/preview</strong> and <strong>/preview/xr</strong>. Local clicks build an interaction trace that mirrors future ThingLink hotspot telemetry.
          </p>
        </div>
        <div className="bg-slate-50/50 p-4 lg:p-6">
          <XRScenarioViewer variant="desktop" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InteractionTimeline
          events={sa.scenarioInteractionEvents}
          heading="Interaction timeline"
          description={
            sa.mappingNote ??
            "Representative class-level signal ordering for the immersive scenario (or public-dataset proxy)."
          }
        />
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold text-slate-900">Hotspot completion</p>
          <p className="text-xs text-[var(--muted)]">Share of learners reaching each milestone</p>
          <div className="mt-5 space-y-4">
            {hotspotWithPathway.map((h) => (
              <div key={h.id}>
                <HotspotCompletionBar label={h.label} percent={h.percent} />
                <p className="mt-1 text-[10px] font-medium text-indigo-700">{h.xrMapping}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] lg:col-span-1">
          <p className="text-sm font-semibold text-slate-900">Learning pathway</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2">
            {sa.learningPathway
              .split("→")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((step, i, arr) => (
                <div key={`${step}-${i}`} className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-800 ring-1 ring-indigo-100">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{step}</span>
                  {i < arr.length - 1 ? (
                    <span className="px-1 text-slate-300" aria-hidden>
                      →
                    </span>
                  ) : null}
                </div>
              ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Mirrors the learner stepper: observe, decide, justify, reflect in an immersive scene.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] lg:col-span-2">
          <p className="text-sm font-semibold text-slate-900">Engagement distribution</p>
          <EngagementDistributionChart data={sa.engagementDistribution} highlightLabel={highlightEngagement} />
        </div>
      </div>

      <div
        className={cn(
          "rounded-2xl border bg-gradient-to-r p-5 shadow-[var(--shadow)]",
          risk === "elevated" || risk === "At risk"
            ? "border-amber-200 from-amber-50 to-white"
            : "border-indigo-100 from-indigo-50 to-white",
        )}
      >
        <p className="text-sm font-semibold text-slate-900">Key insight</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {sa.keyInsight}
          {insightExtra}
        </p>
      </div>
    </div>
  );
}
