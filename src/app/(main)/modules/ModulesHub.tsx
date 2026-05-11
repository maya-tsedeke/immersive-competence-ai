"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Sparkles } from "lucide-react";
import {
  createLearningModule,
  listModules,
  MODULES_CHANGE_EVENT,
  scenarioLabel,
  profileLabel,
} from "@/lib/modules/moduleStore";
import type { DatasetProfileId, ScenarioTypeId } from "@/lib/modules/learningModuleTypes";
import { DATASET_PROFILE_LABELS, SCENARIO_TYPE_LABELS } from "@/lib/modules/learningModuleTypes";
import { cn } from "@/lib/utils";

const SCENARIOS = Object.keys(SCENARIO_TYPE_LABELS) as ScenarioTypeId[];
const PROFILES = Object.keys(DATASET_PROFILE_LABELS) as DatasetProfileId[];

export function ModulesHub() {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    const h = () => refresh();
    window.addEventListener(MODULES_CHANGE_EVENT, h);
    return () => window.removeEventListener(MODULES_CHANGE_EVENT, h);
  }, [refresh]);

  const modules = useMemo(() => {
    void tick;
    return listModules();
  }, [tick]);

  const [title, setTitle] = useState("");
  const [scenarioType, setScenarioType] = useState<ScenarioTypeId>("workplace_safety");
  const [objective, setObjective] = useState(
    "Learners identify hazards, choose safe actions, justify decisions, and reflect for teacher review.",
  );
  const [criteria, setCriteria] = useState("Observation · Decision · Justification · Reflection (prototype rubric).");
  const [template, setTemplate] = useState("OULAD-like engagement + dialogue reflection pairing");
  const [profile, setProfile] = useState<DatasetProfileId>("combined");
  const [nLearners, setNLearners] = useState(24);

  const submit = () => {
    const t = title.trim() || `${scenarioLabel(scenarioType)} module`;
    createLearningModule({
      title: t,
      scenarioType,
      learningObjective: objective.trim(),
      competenceCriteria: criteria.trim(),
      datasetTemplate: template.trim(),
      datasetProfile: profile,
      simulatedLearnerCount: nLearners,
    });
    setTitle("");
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Learning modules</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Create &amp; manage modules</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          ThingLink-inspired research demo: modules define scenario intent and generate a{" "}
          <strong>synthetic cohort preview</strong> shaped like public dataset rows. Runtime evidence stays in{" "}
          <strong>browser storage</strong> on GitHub Pages — export JSON for backups.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Plus className="h-5 w-5 text-indigo-600" aria-hidden />
            Create new learning module
          </h2>
          <div className="mt-4 space-y-4">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Module title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={scenarioLabel(scenarioType)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Scenario type</span>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value as ScenarioTypeId)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                {SCENARIOS.map((s) => (
                  <option key={s} value={s}>
                    {SCENARIO_TYPE_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Learning objective</span>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Competence criteria</span>
              <textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                rows={2}
                className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Dataset similarity template</span>
              <input
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Public dataset profile</span>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value as DatasetProfileId)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                {PROFILES.map((p) => (
                  <option key={p} value={p}>
                    {DATASET_PROFILE_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Simulated learner rows</span>
              <input
                type="number"
                min={3}
                max={200}
                value={nLearners}
                onChange={(e) => setNLearners(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={submit}
              className="w-full min-h-[48px] rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md"
            >
              Save module
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BookOpen className="h-5 w-5 text-indigo-600" aria-hidden />
            Your modules ({modules.length})
          </h2>
          <ul className="mt-4 max-h-[480px] space-y-3 overflow-y-auto pr-1">
            {modules.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/modules/view?mid=${encodeURIComponent(m.id)}`}
                  className={cn(
                    "flex flex-col rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-indigo-200 hover:bg-white",
                  )}
                >
                  <span className="font-semibold text-slate-900">{m.title}</span>
                  <span className="mt-1 text-xs text-slate-600">
                    {scenarioLabel(m.scenarioType)} · {profileLabel(m.datasetProfile)} · {m.simulatedLearnerCount} preview
                    rows
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Open module detail
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
