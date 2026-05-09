import type { ClassAiInsight } from "@/lib/types";

export const classAiInsights: ClassAiInsight[] = [
  {
    id: "1",
    title: "Class-level insight",
    body: "Learners are confident in identifying hazards but weaker in explaining why specific actions are correct.",
    confidence: "High",
  },
  {
    id: "2",
    title: "Common misconception",
    body: "Many learners treat noticing a hazard as equivalent to solving it.",
    confidence: "Medium",
  },
  {
    id: "3",
    title: "Recommended intervention",
    body: "Add a short explanation step after each decision point.",
    confidence: "High",
  },
  {
    id: "4",
    title: "Suggested next activity",
    body: "Ask learners to compare two possible safety actions and justify which is better.",
    confidence: "Medium",
  },
];
