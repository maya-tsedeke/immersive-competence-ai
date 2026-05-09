import type { TimelineEvent } from "@/lib/types";

export const scenarioInteractionEvents: TimelineEvent[] = [
  { id: "t1", label: "Scenario opened", at: "T+0:00" },
  { id: "t2", label: "Hotspot: hazard identified", at: "T+0:45" },
  { id: "t3", label: "Decision branch: mixed outcomes", at: "T+2:10" },
  { id: "t4", label: "Justification quality dip", at: "T+3:05", tone: "warning" },
  { id: "t5", label: "Reflection submitted", at: "T+4:20", tone: "success" },
];

export const learningPathway = "Observe → Decide → Justify → Reflect";
