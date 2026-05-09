"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DialogueInsight } from "@/lib/types";

const COLORS = ["#6366f1", "#8b5cf6", "#0ea5e9", "#22c55e", "#f59e0b", "#94a3b8"];

function countField(rows: DialogueInsight[], key: keyof DialogueInsight): { name: string; value: number }[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    const raw = r[key];
    const label =
      typeof raw === "boolean" ? (raw ? "Yes" : "No") : String(raw ?? "Unknown").trim() || "Unknown";
    m.set(label, (m.get(label) ?? 0) + 1);
  }
  return Array.from(m.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function DialogueDistributionCharts({ dialogue }: { dialogue: DialogueInsight[] }) {
  const reflection = useMemo(() => countField(dialogue, "reflectionQuality"), [dialogue]);
  const reasoning = useMemo(() => countField(dialogue, "reasoningDepth"), [dialogue]);
  const confusion = useMemo(() => countField(dialogue, "confusionDetected"), [dialogue]);

  if (!dialogue.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
        No dialogue insights in generated JSON. Showing class insights only.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ChartCard title="Reflection quality (heuristic)">
        <div className="h-52 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reflection} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={48} />
              <YAxis allowDecimals={false} width={28} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Conversations">
                {reflection.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      <ChartCard title="Reasoning depth (heuristic)">
        <div className="h-52 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reasoning} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} width={28} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Conversations">
                {reasoning.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      <ChartCard title="Detected learning difficulty">
        <div className="h-52 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={confusion}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={68}
                paddingAngle={2}
              >
                {confusion.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
