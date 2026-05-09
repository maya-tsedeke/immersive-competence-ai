export function ModelInfoCard({ className }: { className?: string }) {
  return (
    <section
      className={
        "rounded-2xl border border-amber-100 bg-amber-50/80 p-5 text-sm leading-relaxed text-amber-950 shadow-[var(--shadow)] " +
        (className ?? "")
      }
      aria-label="Model information and limitations"
    >
      <p className="text-sm font-semibold text-amber-950">AI baseline model · Public dataset prototype</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-amber-900/80">Model information / limitations</p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <span className="font-semibold">Dataset sources:</span> OULAD (Open University Learning Analytics) and the
          Google Education Dialogue Dataset — public prototypes, not ThingLink exports.
        </li>
        <li>
          <span className="font-semibold">Model types:</span> Baseline ML (logistic regression, random forest, gradient
          boosting where fitted); dialogue track uses TF–IDF plus linear / SVM classifiers on{" "}
          <span className="font-semibold">heuristic</span> labels (not validated ground truth).
        </li>
        <li>
          <span className="font-semibold">Outputs:</span> Risk indicators, heuristic reflection quality, reasoning depth
          cues, and suggested teacher actions — all <span className="font-semibold">AI-assisted insights</span> for
          teaching practice; they are not definitive rulings or high-stakes scores on their own.
        </li>
        <li>
          <span className="font-semibold">Status:</span> Public-dataset prototype; not validated on real ThingLink data.
        </li>
      </ul>
    </section>
  );
}
