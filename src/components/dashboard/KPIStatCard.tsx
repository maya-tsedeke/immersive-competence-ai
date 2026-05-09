import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KPIStatCard({
  title,
  value,
  subtitle,
  hint,
  hintPositive,
  icon: Icon,
  children,
}: {
  title: string;
  value: string;
  subtitle?: string;
  hint?: string;
  hintPositive?: boolean;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[168px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex flex-1 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</p>
          <p className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-900 sm:text-[1.65rem]">
            {value}
          </p>
          {subtitle ? <p className="mt-1 text-xs leading-snug text-slate-600">{subtitle}</p> : null}
          {hint ? (
            <p
              className={cn(
                "mt-2 text-xs font-medium leading-snug sm:text-sm",
                hintPositive === true && "text-emerald-600",
                hintPositive === false && "text-orange-600",
                hintPositive === undefined && "text-slate-600",
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] sm:h-11 sm:w-11">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
