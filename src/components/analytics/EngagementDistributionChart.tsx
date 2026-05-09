"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EngagementSlice } from "@/lib/types";

export function EngagementDistributionChart({
  data,
  highlightLabel,
}: {
  data: EngagementSlice[];
  /** When set, non-matching segments are de-emphasised (prototype cohort filter). */
  highlightLabel?: string | null;
}) {
  const chartData = data.map((d) => ({ name: d.label, value: d.percent, fill: d.color }));
  return (
    <div className="h-56 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} hide />
          <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => `${value}%`}
            contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  highlightLabel && entry.name !== highlightLabel ? "#e2e8f0" : entry.fill
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
