"use client";

import { useState } from "react";
import Image from "next/image";
import { Home, MessageCircle, Mic, Shapes, User } from "lucide-react";

const WAREHOUSE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80";

const steps = ["Observe", "Decide", "Justify", "Reflect"] as const;

const choices = [
  "Blocked aisle with unstable pallets",
  "Missing hard hats only",
  "Lighting is slightly dim",
  "Nothing significant is visible",
];

export function LearnerScenarioExperience() {
  const [phase, setPhase] = useState<"intro" | "question" | "reflect" | "done">("intro");
  const [selected, setSelected] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");

  return (
    <div className="mx-auto max-w-md px-3 pb-10 pt-2 text-white">
      <div className="rounded-[2.75rem] border border-white/10 bg-gradient-to-b from-slate-900 to-black p-3 shadow-2xl shadow-indigo-500/20">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-black ring-1 ring-white/10">
          <div className="absolute left-1/2 top-3 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-black/70" />
          {phase === "intro" ? (
            <>
              <div className="relative aspect-[10/19] w-full">
                <Image
                  src={WAREHOUSE}
                  alt="Warehouse scenario"
                  fill
                  className="object-cover"
                  sizes="420px"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
                <button
                  type="button"
                  className="absolute left-[16%] top-[30%] flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold shadow-lg ring-2 ring-white/70"
                >
                  Hazard
                </button>
                <button
                  type="button"
                  className="absolute right-[14%] top-[46%] flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold shadow-lg ring-2 ring-white/70"
                >
                  Action
                </button>
                <button
                  type="button"
                  className="absolute left-[38%] bottom-[28%] flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold shadow-lg ring-2 ring-white/70"
                >
                  Reflect
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 pb-5 pt-4 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-1">
                    {steps.map((label, idx) => (
                      <div key={label} className="flex flex-1 flex-col items-center gap-1 text-center">
                        <div
                          className={
                            idx === 0
                              ? "flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900"
                              : "flex h-8 w-8 items-center justify-center rounded-full border border-white/50 text-[11px] font-semibold text-white/90"
                          }
                        >
                          {idx + 1}
                        </div>
                        <span className="text-[10px] font-medium text-white/80">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4 bg-white px-4 py-5 text-slate-900">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Workplace Safety Simulation
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    Explore the environment, identify the hazard, choose the safest action, and explain your
                    reasoning.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPhase("question")}
                  className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 active:scale-[0.99]"
                >
                  Start Scenario
                </button>
              </div>
            </>
          ) : null}

          {phase === "question" ? (
            <div className="flex min-h-[560px] flex-col bg-white px-4 py-6 text-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Observe &amp; decide</p>
              <h2 className="mt-2 text-lg font-semibold">What is the main safety risk in this scene?</h2>
              <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-slate-900">
                <Image src={WAREHOUSE} alt="" fill className="object-cover opacity-90" sizes="400px" />
              </div>
              <div className="mt-4 space-y-2">
                {choices.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelected(c)}
                    className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                      selected === c
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!selected}
                onClick={() => setPhase("reflect")}
                className="mt-4 w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-md transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Continue
              </button>
            </div>
          ) : null}

          {phase === "reflect" ? (
            <div className="flex min-h-[560px] flex-col bg-white px-4 py-6 text-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Justify &amp; reflect</p>
              <h2 className="mt-2 text-lg font-semibold">Explain your reasoning</h2>
              <p className="mt-2 text-sm text-slate-600">
                Describe why your choice reduces risk for everyone in the warehouse.
              </p>
              <textarea
                className="mt-4 min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none ring-indigo-500/0 transition focus:ring-4"
                placeholder="Type a short reflection for your teacher…"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
              <button
                type="button"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                <Mic className="h-4 w-4" />
                Voice note (placeholder)
              </button>
              <button
                type="button"
                onClick={() => setPhase("done")}
                className="mt-4 w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500"
              >
                Submit
              </button>
            </div>
          ) : null}

          {phase === "done" ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center bg-white px-6 py-12 text-center text-slate-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">Response saved</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Your answer has been saved for teacher review.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPhase("intro");
                  setSelected(null);
                  setReflection("");
                }}
                className="mt-8 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
              >
                Restart demo
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="mt-6 grid grid-cols-4 gap-2 rounded-2xl bg-white/5 p-2 text-[11px] font-semibold text-slate-200 ring-1 ring-white/10">
        <button type="button" className="flex flex-col items-center gap-1 rounded-xl py-2 hover:bg-white/5">
          <Home className="h-5 w-5" />
          Home
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2 text-white"
        >
          <Shapes className="h-5 w-5" />
          Scenario
        </button>
        <button type="button" className="flex flex-col items-center gap-1 rounded-xl py-2 hover:bg-white/5">
          <MessageCircle className="h-5 w-5" />
          Question
        </button>
        <button type="button" className="flex flex-col items-center gap-1 rounded-xl py-2 hover:bg-white/5">
          <User className="h-5 w-5" />
          Profile
        </button>
      </nav>
    </div>
  );
}
