"use client";

import Image from "next/image";

const WAREHOUSE =
  "https://images.unsplash.com/photo-1587293852726-70cdc2c93b58?auto=format&fit=crop&w=1200&q=80";

const steps = ["Observe", "Decide", "Justify", "Reflect"] as const;

export function MobileScenarioPreview({
  embedded,
}: {
  /** When true, phone chrome fills parent (dashboard column). When false, full width card. */
  embedded?: boolean;
}) {
  return (
    <div
      className={
        embedded
          ? "relative mx-auto w-full max-w-[340px]"
          : "relative mx-auto w-full max-w-md px-2"
      }
    >
      <div className="rounded-[2.5rem] border border-slate-200 bg-slate-900 p-3 shadow-2xl ring-1 ring-black/5">
        <div className="relative overflow-hidden rounded-[2rem] bg-black">
          <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black/60" />
          <div className="relative aspect-[9/19] w-full bg-slate-950">
            <Image
              src={WAREHOUSE}
              alt="Industrial warehouse training scene"
              fill
              className="object-cover opacity-90"
              sizes="400px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />
            <button
              type="button"
              className="absolute left-[18%] top-[32%] flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/95 text-[10px] font-bold text-white shadow-lg ring-2 ring-white/70"
            >
              Hazard
            </button>
            <button
              type="button"
              className="absolute right-[16%] top-[48%] flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/95 text-[10px] font-bold text-white shadow-lg ring-2 ring-white/70"
            >
              Action
            </button>
            <button
              type="button"
              className="absolute left-[40%] bottom-[32%] flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/95 text-[10px] font-bold text-white shadow-lg ring-2 ring-white/70"
            >
              Reflect
            </button>
            <div className="absolute inset-x-0 bottom-0 bg-black/45 px-3 pb-4 pt-3 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-1">
                {steps.map((label, idx) => (
                  <div key={label} className="flex flex-1 flex-col items-center gap-1 text-center">
                    <div
                      className={
                        idx === 0
                          ? "flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900"
                          : "flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-[11px] font-medium text-white"
                      }
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[9px] font-medium text-white/80">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Workplace Safety Simulation
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              Explore the environment, identify the hazard, choose the safest action, and explain your
              reasoning.
            </p>
            <button
              type="button"
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-[0.99]"
            >
              Start Scenario
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
        Learner preview · Mock interactions
      </p>
    </div>
  );
}
