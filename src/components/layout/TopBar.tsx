"use client";

import { Bell } from "lucide-react";
import { DateRangeSelector } from "@/components/dashboard/DateRangeSelector";
import { ScenarioSelector } from "@/components/dashboard/ScenarioSelector";
import { PrototypeBadge } from "@/components/layout/PrototypeBadge";
import { RoleSwitch } from "@/components/layout/RoleSwitch";
import { cn } from "@/lib/utils";

export function TopBar({
  className,
  showMlBaselineBadge,
}: {
  className?: string;
  showMlBaselineBadge?: boolean;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex flex-col gap-3 border-b border-[var(--border)] bg-white/90 px-4 py-3 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3 md:max-w-none md:flex-row md:flex-wrap md:items-end md:gap-3">
        <div className="flex shrink-0 flex-col gap-2 self-start sm:flex-row sm:items-center md:order-first">
          <PrototypeBadge className="shrink-0" usesGeneratedData={showMlBaselineBadge} />
          <RoleSwitch />
          <span
            className="inline-flex shrink-0 items-center rounded-full border border-indigo-100 bg-indigo-50/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-800 shadow-sm"
            title={
              showMlBaselineBadge
                ? "Dashboard populated from generated JSON where present; baseline models trained on public datasets."
                : "Demonstration layer using mock data; connect generated JSON or ThingLink export for research pilots."
            }
          >
            AI baseline model · Public dataset prototype
          </span>
        </div>
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              Scenario
            </span>
            <ScenarioSelector />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
              Date range
            </span>
            <DateRangeSelector />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <button
          type="button"
          className="rounded-xl border border-[var(--border)] bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50"
          aria-label="Notifications (prototype)"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
          UR
        </div>
      </div>
    </header>
  );
}
