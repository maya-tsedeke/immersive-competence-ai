import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] transition",
        "hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md",
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-800 transition group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)]">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      </div>
    </Link>
  );
}
