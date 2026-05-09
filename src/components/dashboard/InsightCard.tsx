import { Lightbulb } from "lucide-react";
import Link from "next/link";

export function InsightCard({
  title,
  body,
  href,
  linkLabel,
}: {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-[var(--shadow)]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
        <Lightbulb className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
        {href && linkLabel ? (
          <Link
            href={href}
            className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
