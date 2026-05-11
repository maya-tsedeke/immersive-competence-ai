"use client";

import {
  CLASS_DISTRIBUTION_DEMO,
  DIALOGUE_RAW_SUMMARY,
  NUMERIC_HISTOGRAM_DEMO,
  OULAD_RAW_SUMMARY,
  PROCESSED_SUMMARY,
  THINGLINK_MAPPING_ROWS,
} from "@/lib/data/datasetExplorerStats";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#6366f1", "#0ea5e9", "#22c55e", "#f59e0b", "#a855f7", "#94a3b8"];

function DistCard({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)]">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie dataKey="value" data={data} nameKey="name" cx="50%" cy="50%" outerRadius={72}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Illustrative class mix for conference demo — not raw cohort counts.
      </p>
    </div>
  );
}

export function DatasetsExplorerClient() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Datasets</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dataset explorer</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Public-dataset research prototype: characteristics of OULAD-style and dialogue-style sources used in the ML
          narrative. <strong>No large raw CSVs</strong> are required at runtime on GitHub Pages — only bundled summaries.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <h2 className="text-sm font-semibold text-slate-900">Raw dataset overview — OULAD</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              <strong>Rows (approx):</strong> {OULAD_RAW_SUMMARY.approximateRows.toLocaleString()}
            </li>
            <li>
              <strong>Columns (approx):</strong> {OULAD_RAW_SUMMARY.approximateColumns}
            </li>
            <li>
              <strong>Files:</strong> {OULAD_RAW_SUMMARY.fileSizeNote}
            </li>
            <li>
              <strong>Missing cells:</strong> {OULAD_RAW_SUMMARY.missingCellsPct}
            </li>
            <li>
              <strong>Duplicates:</strong> {OULAD_RAW_SUMMARY.duplicateRows}
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <h2 className="text-sm font-semibold text-slate-900">Raw dataset overview — Dialogue</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              <strong>Rows (approx):</strong> {DIALOGUE_RAW_SUMMARY.approximateRows.toLocaleString()}
            </li>
            <li>
              <strong>Columns (approx):</strong> {DIALOGUE_RAW_SUMMARY.approximateColumns}
            </li>
            <li>
              <strong>Files:</strong> {DIALOGUE_RAW_SUMMARY.fileSizeNote}
            </li>
            <li>
              <strong>Missing cells:</strong> {DIALOGUE_RAW_SUMMARY.missingCellsPct}
            </li>
            <li>
              <strong>Duplicates:</strong> {DIALOGUE_RAW_SUMMARY.duplicateRows}
            </li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold text-slate-900">Processed dataset overview</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>{PROCESSED_SUMMARY.ouladGrid}</li>
          <li>{PROCESSED_SUMMARY.dialogueGrid}</li>
          <li>{PROCESSED_SUMMARY.uniqueLearnersNote}</li>
          <li>{PROCESSED_SUMMARY.topicsNote}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Class distributions (demo charts)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DistCard title="Final Learning Outcome" data={CLASS_DISTRIBUTION_DEMO.finalLearningOutcome} />
          <DistCard title="Learner Risk Status" data={CLASS_DISTRIBUTION_DEMO.learnerRiskStatus} />
          <DistCard title="Reflection Quality" data={CLASS_DISTRIBUTION_DEMO.reflectionQuality} />
          <DistCard title="Detected Learning Difficulty" data={CLASS_DISTRIBUTION_DEMO.detectedLearningDifficulty} />
          <DistCard title="Reasoning Depth" data={CLASS_DISTRIBUTION_DEMO.reasoningDepth} />
          <DistCard title="Need for Teacher Feedback" data={CLASS_DISTRIBUTION_DEMO.teacherFeedbackNeed} />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold text-slate-900">Numeric distributions (synthetic histogram)</h2>
        <div className="mt-4 h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={NUMERIC_HISTOGRAM_DEMO} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="learners" fill="#0ea5e9" name="Learners" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
        <h2 className="text-sm font-semibold text-indigo-950">Dataset → ThingLink-style mapping</h2>
        <ul className="mt-3 space-y-2 text-sm text-indigo-950/90">
          {THINGLINK_MAPPING_ROWS.map((r) => (
            <li key={r.from}>
              <strong>{r.from}</strong> → {r.to}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
