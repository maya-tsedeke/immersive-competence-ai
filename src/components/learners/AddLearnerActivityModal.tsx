"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import {
  createDemoLearner,
  DEMO_LEARNERS_CHANGE_EVENT,
  nextDemoLearnerId,
  setActivePreviewLearnerId,
} from "@/lib/learnerDemo/demoLearnersStore";
import { cn } from "@/lib/utils";

const DEFAULT_SCENARIO = "Workplace Safety Simulation";
const DEFAULT_OBJECTIVE = "Identify workplace hazards and justify safe actions";

export function AddLearnerActivityModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const baseId = useId();
  const [learnerId, setLearnerId] = useState("");

  useEffect(() => {
    if (open) setLearnerId(nextDemoLearnerId());
  }, [open]);
  const [name, setName] = useState("");
  const [scenario, setScenario] = useState(DEFAULT_SCENARIO);
  const [objective, setObjective] = useState(DEFAULT_OBJECTIVE);
  const [startMode, setStartMode] = useState<"learner_now" | "teacher_queue">("learner_now");

  const reset = useCallback(() => {
    setLearnerId(nextDemoLearnerId());
    setName("");
    setScenario(DEFAULT_SCENARIO);
    setObjective(DEFAULT_OBJECTIVE);
    setStartMode("learner_now");
  }, []);

  const submit = () => {
    const id = learnerId.trim() || nextDemoLearnerId();
    const row = createDemoLearner({
      id,
      displayName: name.trim() || "Anonymous",
      scenarioTitle: scenario.trim(),
      objective: objective.trim(),
      startMode,
    });
    setActivePreviewLearnerId(row.id);
    window.dispatchEvent(new CustomEvent(DEMO_LEARNERS_CHANGE_EVENT));
    onClose();
    reset();
    if (startMode === "learner_now") {
      router.push(`/preview?learner=${encodeURIComponent(row.id)}`);
    } else {
      router.push("/dashboard");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-end justify-center bg-black/55 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${baseId}-title`}
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h2 id={`${baseId}-title`} className="text-lg font-semibold text-slate-900">
          Add New Learner Activity
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Creates a browser-only demo learner with independent evidence and teacher workflow.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
            Learner ID
            <input
              value={learnerId}
              onChange={(e) => setLearnerId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
            Learner name (optional)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
            Scenario
            <input
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
            Learning objective
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <fieldset className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">Start mode</legend>
            <div className="mt-2 flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="startMode"
                  checked={startMode === "learner_now"}
                  onChange={() => setStartMode("learner_now")}
                />
                Start as learner now
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="startMode"
                  checked={startMode === "teacher_queue"}
                  onChange={() => setStartMode("teacher_queue")}
                />
                Add to teacher queue
              </label>
            </div>
          </fieldset>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className={cn(
              "min-h-[44px] rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700",
            )}
          >
            Create &amp; continue
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddLearnerActivityButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700",
          className,
        )}
      >
        Add New Learner Activity
      </button>
      <AddLearnerActivityModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
