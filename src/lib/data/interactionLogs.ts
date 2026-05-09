import type { InteractionLog } from "@/lib/types";

export const interactionLogs: InteractionLog[] = [
  {
    learnerId: "B221",
    events: [
      { id: "1", label: "Opened scenario", tone: "default" },
      { id: "2", label: "Clicked hazard hotspot", tone: "success" },
      { id: "3", label: "Selected wrong action", tone: "warning" },
      { id: "4", label: "Revised answer", tone: "default" },
      { id: "5", label: "Submitted reflection", tone: "success" },
    ],
  },
  {
    learnerId: "A104",
    events: [
      { id: "1", label: "Opened scenario" },
      { id: "2", label: "Clicked hazard hotspot" },
      { id: "3", label: "Selected safest action" },
      { id: "4", label: "Submitted strong justification" },
      { id: "5", label: "Submitted reflection" },
    ],
  },
  {
    learnerId: "C087",
    events: [
      { id: "1", label: "Opened scenario" },
      { id: "2", label: "Clicked hazard hotspot" },
      { id: "3", label: "Paused before justification" },
      { id: "4", label: "Submitted reflection", tone: "success" },
    ],
  },
  {
    learnerId: "D330",
    events: [
      { id: "1", label: "Opened scenario" },
      { id: "2", label: "Skipped hazard tag initially", tone: "warning" },
      { id: "3", label: "Returned to observation" },
      { id: "4", label: "Submitted reflection", tone: "success" },
    ],
  },
  {
    learnerId: "E119",
    events: [
      { id: "1", label: "Opened scenario" },
      { id: "2", label: "Rapid hazard identification" },
      { id: "3", label: "High-quality justification" },
      { id: "4", label: "Submitted reflection", tone: "success" },
    ],
  },
];

export function getLogForLearner(learnerId: string) {
  return interactionLogs.find((l) => l.learnerId === learnerId);
}
