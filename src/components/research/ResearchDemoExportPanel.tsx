"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Download, FileJson, Upload } from "lucide-react";
import {
  buildResearchDemoExport,
  downloadJson,
  exportFullDemoBundle,
  importResearchDemoBundle,
} from "@/lib/storage/jsonExport";

export function ResearchDemoExportPanel({ compact }: { compact?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const msgId = useId();
  const [message, setMessage] = useState<string | null>(null);

  const onImport = useCallback((file: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result)) as unknown;
        const res = importResearchDemoBundle(data);
        setMessage(res.ok ? "Import complete — merged into browser storage." : res.error ?? "Import failed");
      } catch {
        setMessage("Invalid JSON file.");
      }
    };
    r.readAsText(file);
  }, []);

  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm"
          : "rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]"
      }
    >
      <h3 className="text-sm font-semibold text-slate-900">Export / import demo state</h3>
      <p id={msgId} className="mt-2 text-xs leading-relaxed text-slate-600">
        <strong>GitHub Pages</strong> cannot write to <code className="rounded bg-white/80 px-1">src/lib/generated</code>{" "}
        at runtime. Use browser storage, then export JSON for backups or conference demos.{" "}
        <strong>SQLite / server DB</strong> is optional for future deployment — see{" "}
        <code className="rounded bg-white/80 px-1">src/lib/storage/sqliteAdapter.server.ts</code>.
      </p>
      {message ? (
        <p className="mt-2 text-xs font-medium text-indigo-800" role="status">
          {message}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => exportFullDemoBundle()}
        >
          <FileJson className="h-4 w-4 shrink-0" aria-hidden />
          Export full demo JSON
        </button>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          onClick={() => {
            const b = buildResearchDemoExport();
            downloadJson(`learning-evidence-${Date.now()}.json`, {
              exportedAt: b.exportedAt,
              teacherWorkflow: b.teacherWorkflow,
              demoLearners: b.demoLearners,
              modules: b.modules,
            });
          }}
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden />
          Download evidence snapshot
        </button>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4 shrink-0" aria-hidden />
          Import demo JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
