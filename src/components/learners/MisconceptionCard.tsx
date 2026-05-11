import { AlertTriangle, Info, Sparkles } from "lucide-react";

/**
 * Classifies dialogue-style misconception strings from generated / demo data.
 * Many rows say "no strong signal" but the old UI always showed a red alert.
 */
export function misconceptionTone(text: string): "clear" | "watch" | "concern" {
  const t = text.trim().toLowerCase();
  if (
    t.includes("no persistent misconception") ||
    t.includes("no strong confusion heuristic") ||
    (t.includes("no misconception") && !t.includes("heuristic cue"))
  ) {
    return "clear";
  }
  if (
    t.includes("heuristic cue") ||
    t.includes("instructional signal only") ||
    t.includes("uncertainty in the sampled dialogue")
  ) {
    return "watch";
  }
  return "concern";
}

export function MisconceptionCard({ text }: { text: string }) {
  const tone = misconceptionTone(text);

  if (tone === "clear") {
    return (
      <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/90 p-4 shadow-[var(--shadow)] ring-1 ring-emerald-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
          <Info className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-950">Misconception check (prototype)</p>
          <p className="mt-1 text-xs text-emerald-900/80">
            No strong “wrong idea” signal in this snapshot. The line below is a neutral model readout, not proof the
            learner has no misunderstandings elsewhere.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-950/95">{text}</p>
        </div>
      </div>
    );
  }

  if (tone === "watch") {
    return (
      <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/90 p-4 shadow-[var(--shadow)] ring-1 ring-amber-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-950">Possible confusion cue (heuristic)</p>
          <p className="mt-1 text-xs text-amber-900/85">
            Soft language signal only — not a clinical diagnosis. Use it to prompt a conversation, not to label the
            learner.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-950/95">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 shadow-[var(--shadow)] ring-1 ring-red-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-900">Misconception or weak understanding (review)</p>
        <p className="mt-2 text-sm leading-relaxed text-red-900/90">{text}</p>
      </div>
    </div>
  );
}
