import { cn } from "@/lib/utils";

export function PrototypeBadge({
  className,
  compact,
  usesGeneratedData,
}: {
  className?: string;
  compact?: boolean;
  /** When true, JSON from the ML pipeline is present under src/lib/generated */
  usesGeneratedData?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--border)] bg-white/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)] shadow-sm backdrop-blur-sm",
        compact && "px-2 py-0.5 text-[10px]",
        className,
      )}
      title={
        usesGeneratedData
          ? "Dashboard populated from public-dataset ML JSON; not live ThingLink telemetry."
          : "Demonstration data only; replace with generated JSON or ThingLink export for research pilots."
      }
    >
      {usesGeneratedData ? "UEF · Generated JSON · Research prototype" : "UEF · Mock data · Research prototype"}
    </span>
  );
}
