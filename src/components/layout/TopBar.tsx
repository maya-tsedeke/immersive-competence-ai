"use client";

import { Bell, Menu } from "lucide-react";
import { useCallback, useState } from "react";
import { DateRangeSelector } from "@/components/dashboard/DateRangeSelector";
import { ScenarioSelector } from "@/components/dashboard/ScenarioSelector";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { PrototypeBadge } from "@/components/layout/PrototypeBadge";
import { RoleSwitch } from "@/components/layout/RoleSwitch";
import { cn } from "@/lib/utils";

function FilterPair({ dense }: { dense?: boolean }) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 gap-2 sm:gap-3 lg:max-w-2xl",
        !dense && "md:flex-1",
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <span
          className={cn(
            "font-semibold uppercase tracking-wide text-[var(--muted)]",
            dense ? "text-[9px]" : "text-[10px]",
          )}
        >
          Scenario
        </span>
        <ScenarioSelector />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <span
          className={cn(
            "font-semibold uppercase tracking-wide text-[var(--muted)]",
            dense ? "text-[9px]" : "text-[10px]",
          )}
        >
          Date range
        </span>
        <DateRangeSelector />
      </div>
    </div>
  );
}

export function TopBar({
  className,
  showMlBaselineBadge,
}: {
  className?: string;
  showMlBaselineBadge?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <MobileNavDrawer open={menuOpen} onClose={closeMenu} />
      <header
        className={cn(
          "sticky top-0 z-30 flex flex-col gap-2 border-b border-[var(--border)] bg-white/95 px-3 py-2 backdrop-blur",
          "md:flex-row md:items-center md:justify-between md:gap-3 md:px-6 md:py-3",
          className,
        )}
      >
        {/* Mobile: menu + compact controls (single row, horizontal scroll for role strip) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label="Open main menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1 overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <div className="flex w-max max-w-none items-center gap-2 pr-1">
              <PrototypeBadge compact className="shrink-0" usesGeneratedData={showMlBaselineBadge} />
              <RoleSwitch compact />
            </div>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Notifications (prototype)"
          >
            <Bell className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            UR
          </div>
        </div>

        <div className="md:hidden">
          <FilterPair dense />
        </div>

        {/* Desktop */}
        <div className="hidden min-w-0 w-full flex-1 flex-col gap-3 md:flex md:flex-row md:flex-wrap md:items-end">
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
          <FilterPair />
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex md:gap-3">
          <button
            type="button"
            className="rounded-xl border border-[var(--border)] bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Notifications (prototype)"
          >
            <Bell className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            UR
          </div>
        </div>
      </header>
    </>
  );
}
