"use client";

import Image from "next/image";

const WAREHOUSE =
  "https://images.unsplash.com/photo-1587293852726-70cdc2c93b58?auto=format&fit=crop&w=1200&q=80";

/** Optional static hotspot legend (not used on analytics by default — kept for reuse). */
export function ScenarioHotspotMap() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)]">
      <div className="relative aspect-[16/9] w-full bg-slate-900">
        <Image
          src={WAREHOUSE}
          alt="Scenario hotspots overview"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 960px"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/35 via-transparent to-sky-900/25" />
        <div className="absolute left-[20%] top-[35%] h-4 w-4 rounded-full bg-orange-400 ring-4 ring-white/80 shadow" />
        <div className="absolute right-[22%] top-[52%] h-4 w-4 rounded-full bg-sky-400 ring-4 ring-white/80 shadow" />
        <div className="absolute left-[48%] bottom-[30%] h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-white/80 shadow" />
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-3 text-xs text-[var(--muted)]">
        <span className="rounded-full bg-orange-50 px-2 py-1 font-semibold text-orange-800 ring-1 ring-orange-100">
          Hazard
        </span>
        <span className="rounded-full bg-sky-50 px-2 py-1 font-semibold text-sky-800 ring-1 ring-sky-100">
          Action
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-800 ring-1 ring-emerald-100">
          Reflection
        </span>
      </div>
    </div>
  );
}
