"use client";

import { demoAlert } from "@/lib/utils";
import { ReportPreviewCard } from "@/components/reports/ReportPreviewCard";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";

import type { ReportSummary } from "@/lib/types";

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function reportToCsv(report: ReportSummary): string {
  const lines: string[] = [];
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  lines.push(["title", "scenarioName", "learnerCount", "classSummary"].map(esc).join(","));
  lines.push(
    [report.title, report.scenarioName, String(report.learnerCount), report.classSummary].map(esc).join(","),
  );
  lines.push("");
  lines.push(["atRiskLearners"].join(","));
  for (const id of report.atRiskLearners) lines.push(esc(id));
  lines.push("");
  lines.push(["misconceptions"].join(","));
  for (const m of report.misconceptions) lines.push(esc(m));
  lines.push("");
  lines.push(["recommendedActions"].join(","));
  for (const a of report.recommendedActions) lines.push(esc(a));
  return lines.join("\n");
}

export function ReportsClient({
  report,
  analyzedCount,
  atRisk,
  needsFeedback,
  strong,
  commonDifficulty,
  sampleTeacherAction,
  usingGeneratedJson,
}: {
  report: ReportSummary;
  analyzedCount: number;
  atRisk: number;
  needsFeedback: number;
  strong: number;
  commonDifficulty: string;
  sampleTeacherAction: string;
  usingGeneratedJson: boolean;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Reports</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Competence Analytics Report preview</h1>
        <p className="mt-2 text-sm text-slate-600">
          Teacher-facing summary from generated <code className="rounded bg-slate-100 px-1">reportSummary.json</code> when
          present. Exports below download placeholder files; PDF remains a prototype alert.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">AI results summary</h2>
          <ProvenanceBadge kind={usingGeneratedJson ? "ml_pipeline" : "mock_fallback"} />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs font-bold uppercase text-[var(--muted)]">Learners analyzed (demo scope)</dt>
            <dd className="text-lg font-semibold text-slate-900">{analyzedCount}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs font-bold uppercase text-[var(--muted)]">Risk indicators · file-backed</dt>
            <dd className="font-medium text-slate-900">
              At risk: {atRisk} · Needs feedback: {needsFeedback} · Strong: {strong}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 sm:col-span-2">
            <dt className="text-xs font-bold uppercase text-[var(--muted)]">Common detected learning difficulty</dt>
            <dd className="text-slate-800">{commonDifficulty}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 sm:col-span-2">
            <dt className="text-xs font-bold uppercase text-[var(--muted)]">Example suggested teacher action</dt>
            <dd className="text-slate-800">{sampleTeacherAction}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          <strong>Prototype limitation:</strong> This is an AI-assisted insight from a public-dataset prototype — not a
          final assessment or guaranteed coverage of every learner.
        </p>
      </div>

      <ReportPreviewCard report={report} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() =>
            demoAlert(
              "PDF export is not wired in this prototype build. Use JSON/CSV for the demo, or connect a print stylesheet later.",
            )
          }
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:flex-none"
        >
          PDF
        </button>
        <button
          type="button"
          onClick={() => downloadBlob("competence-report-preview.csv", reportToCsv(report), "text/csv;charset=utf-8")}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 sm:flex-none"
        >
          CSV
        </button>
        <button
          type="button"
          onClick={() =>
            downloadBlob("competence-report-preview.json", JSON.stringify(report, null, 2), "application/json")
          }
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 sm:flex-none"
        >
          JSON
        </button>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href);
            demoAlert("Share: meeting link copied if the browser allows clipboard access.");
          }}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800 shadow-sm transition hover:bg-indigo-100 sm:flex-none"
        >
          Share
        </button>
      </div>
    </div>
  );
}
