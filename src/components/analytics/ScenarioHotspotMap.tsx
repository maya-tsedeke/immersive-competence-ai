"use client";

import Image from "next/image";
import { useState } from "react";
import { XR_PANORAMA_URL } from "@/lib/xr/scenarioHotspots";

/**
 * Small static “where are the dots” illustration for narrow viewports only.
 * Shown on phones/tablets before the full XR block; hidden on lg+ to avoid duplicating the interactive canvas.
 */
export function ScenarioHotspotMap() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)]">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Quick hotspot reference</p>
        <p className="mt-1 text-sm leading-snug text-slate-700">
          The <strong className="font-semibold text-slate-900">three coloured circles</strong> mark example hotspot
          locations (Hazard, Safe action, Reflection). This is a <strong className="font-semibold">static picture</strong>
          , not live data. Scroll down for the <strong className="font-semibold">interactive 360° scene</strong>.
        </p>
      </div>
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
        {!imageFailed ? (
          <>
            <Image
              src={XR_PANORAMA_URL}
              alt="Warehouse scene with example hazard, action, and reflection hotspot positions"
              fill
              className="object-cover object-center"
              sizes="100vw"
              unoptimized
              onError={() => setImageFailed(true)}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-transparent to-sky-900/15" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center">
            <p className="text-sm font-medium text-slate-800">Preview image did not load</p>
            <p className="text-xs text-slate-600">
              Use the interactive learner canvas below — it uses the same type of panoramic scene and markers.
            </p>
          </div>
        )}
        {!imageFailed ? (
          <>
            <div
              className="absolute left-[20%] top-[35%] z-[1] h-4 w-4 rounded-full bg-orange-400 ring-4 ring-white/90 shadow-md"
              title="Example: Hazard hotspot"
              aria-hidden
            />
            <div
              className="absolute right-[22%] top-[52%] z-[1] h-4 w-4 rounded-full bg-sky-400 ring-4 ring-white/90 shadow-md"
              title="Example: Safe action hotspot"
              aria-hidden
            />
            <div
              className="absolute left-[48%] bottom-[30%] z-[1] h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-white/90 shadow-md"
              title="Example: Reflection hotspot"
              aria-hidden
            />
          </>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3 text-xs text-[var(--muted)]">
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
