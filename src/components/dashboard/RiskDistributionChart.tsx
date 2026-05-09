"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Learner } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  Strong: "#22c55e",
  "Needs feedback": "#f59e0b",
  "At risk": "#ef4444",
};

export function RiskDistributionChart({ learners }: { learners: Learner[] }) {
  const counts: Record<string, number> = { Strong: 0, "Needs feedback": 0, "At risk": 0 };
  for (const l of learners) {
    const s = l.displayStatus ?? l.status;
    counts[s] = (counts[s] ?? 0) + 1;
  }
  const data = (Object.keys(counts) as Array<keyof typeof counts>).map((name) => ({
    name,
    value: counts[name],
    fill: STATUS_COLORS[name] ?? "#6366f1",
  }));

  return (
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.06)" }}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Learners">
            {data.map((e) => (
              <Cell key={e.name} fill={e.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
