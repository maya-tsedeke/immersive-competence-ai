"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CompletionSlice } from "@/lib/types";

export function CompletionDonutChart({ data }: { data: CompletionSlice[] }) {
  const primary = data[0];
  return (
    <div className="flex min-h-[260px] w-full min-w-0 flex-col gap-4 lg:min-h-[280px]">
      <div className="mx-auto h-[200px] min-h-[200px] w-full min-w-0 max-w-[280px] lg:h-[220px] lg:min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}%`, name]}
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-3 text-sm">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Progress</p>
          <p className="mt-1 text-2xl font-semibold leading-tight text-slate-900">{primary?.value}%</p>
          <p className="mt-1 break-words text-xs leading-snug text-[var(--muted)]">
            Primary segment: {primary?.name}
          </p>
        </div>
        <ul className="flex flex-col gap-2.5">
          {data.map((d) => (
            <li
              key={d.name}
              className="flex w-full min-w-0 items-center justify-between gap-3 text-xs"
            >
              <span className="flex min-w-0 flex-1 items-center gap-2 text-slate-600">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: d.color }}
                  aria-hidden
                />
                <span className="min-w-0 break-words">{d.name}</span>
              </span>
              <span className="shrink-0 tabular-nums font-semibold text-slate-900">{d.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
