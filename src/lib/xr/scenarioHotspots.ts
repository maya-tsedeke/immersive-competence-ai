import type { HotspotBarItem } from "@/lib/types";

/** Learner pathway steps shown in the XR UI. */
export const PATHWAY_STEPS = ["Observe", "Decide", "Justify", "Reflect"] as const;
export type PathwayStep = (typeof PATHWAY_STEPS)[number];

export type XRHotspotId = "hazard" | "action" | "justify" | "reflection" | "ai-hint";

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
  icon: "hazard" | "action" | "reflect" | "ai" | "justify";
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
    leftPct: 14,
    topPct: 26,
    ringClass: "bg-orange-500 ring-orange-100",
    icon: "hazard",
  },
  {
    id: "action",
    label: "Safe Action",
    pathwayStep: "Decide",
    pathwayIndex: 1,
    leftPct: 34,
    topPct: 36,
    ringClass: "bg-sky-500 ring-sky-100",
    icon: "action",
  },
  {
    id: "justify",
    label: "Why?",
    pathwayStep: "Justify",
    pathwayIndex: 2,
    leftPct: 50,
    topPct: 30,
    ringClass: "bg-amber-500 ring-amber-100",
    icon: "justify",
  },
  {
    id: "ai-hint",
    label: "Hint",
    pathwayStep: "Justify",
    pathwayIndex: 2,
    leftPct: 63,
    topPct: 22,
    ringClass: "bg-violet-600 ring-violet-100",
    icon: "ai",
  },
  {
    id: "reflection",
    label: "Reflect",
    pathwayStep: "Reflect",
    pathwayIndex: 3,
    leftPct: 76,
    topPct: 42,
    ringClass: "bg-emerald-500 ring-emerald-100",
    icon: "reflect",
  },
];

/** Pedagogical sequence excluding optional Hint. */
export const REQUIRED_HOTSPOT_ORDER: XRHotspotId[] = ["hazard", "action", "justify", "reflection"];

/** Aligns JSON hotspot completion rows to XR pathway / hotspot naming for teacher analytics. */
export function annotateHotspotCompletionWithPathway(
  items: HotspotBarItem[],
): Array<HotspotBarItem & { xrMapping: string }> {
  const labels = [
    "Hazard → Observe",
    "Safe Action → Decide",
    "Why? → Justify",
    "Hint → scaffold",
    "Reflect → Reflect",
  ];
  return items.map((h, i) => ({
    ...h,
    xrMapping: labels[i] ?? "Pathway step",
  }));
}
