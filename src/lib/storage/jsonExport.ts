import type { ResearchDemoExportV1 } from "@/lib/storage/storageTypes";
import { STORAGE_NOTE_STATIC } from "@/lib/storage/browserStorage";
import {
  DEMO_LEARNERS_STORAGE_KEY,
  DEMO_LEARNERS_CHANGE_EVENT,
  readDemoActivityLog,
} from "@/lib/learnerDemo/demoLearnersStore";
import { readWorkflowStore, TEACHER_WORKFLOW_STORAGE_KEY, dispatchWorkflowChanged } from "@/lib/workflow/teacherWorkflowStorage";
import { listModules, upsertModules } from "@/lib/modules/moduleStore";

function readDemoLearnersRaw(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DEMO_LEARNERS_STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as { learners?: Record<string, unknown> };
    return p.learners && typeof p.learners === "object" ? (p.learners as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function buildResearchDemoExport(): ResearchDemoExportV1 {
  const wf = readWorkflowStore();
  const s = readDemoLearnersRaw();
  const demoLearners = s as ResearchDemoExportV1["demoLearners"];
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    disclaimer: STORAGE_NOTE_STATIC,
    modules: listModules(),
    demoLearners,
    demoActivity: readDemoActivityLog()
      .slice()
      .reverse()
      .map((a) => ({ at: a.at, learnerId: a.learnerId, message: a.message })),
    teacherWorkflow: wf,
  };
}

export function downloadJson(filename: string, data: unknown) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportFullDemoBundle() {
  downloadJson(`immersive-competence-ai-demo-${Date.now()}.json`, buildResearchDemoExport());
}

/**
 * Import merged snapshot. Merges modules, learners, workflow (per-key).
 * Does not delete existing keys not in import unless `replaceAll` (dangerous — off by default).
 */
export function importResearchDemoBundle(json: unknown): { ok: boolean; error?: string } {
  if (typeof window === "undefined") return { ok: false, error: "Client only" };
  try {
    const p = json as ResearchDemoExportV1;
    if (p.version !== 1 || !p.demoLearners) return { ok: false, error: "Invalid bundle (expected version 1)" };

    if (p.modules?.length) {
      upsertModules(p.modules);
    }

    const prevRaw = window.localStorage.getItem(DEMO_LEARNERS_STORAGE_KEY);
    const prev = prevRaw
      ? (JSON.parse(prevRaw) as { version?: number; learners?: Record<string, unknown>; activity?: unknown[] })
      : { version: 1, learners: {}, activity: [] };
    const mergedLearners = { ...prev.learners, ...p.demoLearners };
    window.localStorage.setItem(
      DEMO_LEARNERS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        learners: mergedLearners,
        activity: Array.isArray(prev.activity) ? prev.activity : [],
      }),
    );

    if (p.teacherWorkflow && typeof p.teacherWorkflow === "object") {
      const mergedWf = { ...readWorkflowStore(), ...p.teacherWorkflow };
      window.localStorage.setItem(TEACHER_WORKFLOW_STORAGE_KEY, JSON.stringify(mergedWf));
    }

    window.dispatchEvent(new CustomEvent("immersive-demo-bundle-imported"));
    window.dispatchEvent(new CustomEvent("immersive-module-store-changed"));
    window.dispatchEvent(new CustomEvent(DEMO_LEARNERS_CHANGE_EVENT));
    dispatchWorkflowChanged();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Import failed" };
  }
}

export { DEMO_LEARNERS_STORAGE_KEY, TEACHER_WORKFLOW_STORAGE_KEY };
