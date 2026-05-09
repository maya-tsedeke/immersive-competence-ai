import { AlertTriangle } from "lucide-react";

export function MisconceptionCard({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-[var(--shadow)] ring-1 ring-red-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-900">Misconception detected</p>
        <p className="mt-2 text-sm leading-relaxed text-red-900/90">{text}</p>
      </div>
    </div>
  );
}
