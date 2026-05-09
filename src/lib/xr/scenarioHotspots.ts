import type { HotspotBarItem } from "@/lib/types";

/** Learner pathway steps shown in the XR UI. */
export const PATHWAY_STEPS = ["Observe", "Decide", "Justify", "Reflect"] as const;
export type PathwayStep = (typeof PATHWAY_STEPS)[number];

export type XRHotspotId = "hazard" | "action" | "reflection" | "ai-hint";

export interface XRHotspotDefinition {
  id: XRHotspotId;
  label: string;
  /** Maps to pathway for analytics / teacher view */
  pathwayStep: PathwayStep;
  pathwayIndex: number;
  /** Position on panoramic strip (percent of wide canvas) */
  leftPct: number;
  topPct: number;
  ringClass: string;
  icon: "hazard" | "action" | "reflect" | "ai";
}

export const XR_PANORAMA_URL =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2800&q=80";

/** Panorama width multiplier vs viewport (simulate 360° strip). */
export const XR_PANORAMA_WIDTH_MULT = 2.75;

export const XR_HOTSPOTS: XRHotspotDefinition[] = [
  {
    id: "hazard",
    label: "Hazard",
    pathwayStep: "Observe",
    pathwayIndex: 0,
    leftPct: 16,
    topPct: 28,
    ringClass: "bg-orange-500 ring-orange-100",
    icon: "hazard",
  },
  {
    id: "action",
    label: "Action",
    pathwayStep: "Decide",
    pathwayIndex: 1,
    leftPct: 42,
    topPct: 38,
    ringClass: "bg-sky-500 ring-sky-100",
    icon: "action",
  },
  {
    id: "ai-hint",
    label: "AI Hint",
    pathwayStep: "Justify",
    pathwayIndex: 2,
    leftPct: 58,
    topPct: 24,
    ringClass: "bg-violet-600 ring-violet-100",
    icon: "ai",
  },
  {
    id: "reflection",
    label: "Reflection",
    pathwayStep: "Reflect",
    pathwayIndex: 3,
    leftPct: 72,
    topPct: 44,
    ringClass: "bg-emerald-500 ring-emerald-100",
    icon: "reflect",
  },
];

/** Aligns JSON hotspot completion rows to XR pathway / hotspot naming for teacher analytics. */
export function annotateHotspotCompletionWithPathway(
  items: HotspotBarItem[],
): Array<HotspotBarItem & { xrMapping: string }> {
  const labels = [
    "Hazard → Observe",
    "Action → Decide",
    "AI Hint → Justify",
    "Reflection → Reflect",
  ];
  return items.map((h, i) => ({
    ...h,
    xrMapping: labels[i] ?? "Pathway step",
  }));
}
