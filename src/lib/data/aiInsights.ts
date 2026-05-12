import type { ClassAiInsight } from "@/lib/types";

export const classAiInsights: ClassAiInsight[] = [
  {
    id: "1",
    title: "Class-level insight",
    body: "Learners often complete observation steps but need stronger evidence-based justification after decisions.",
    confidence: "High",
  },
  {
    id: "2",
    title: "Common learning pattern",
    body: "Many learners treat noticing evidence as equivalent to explaining what the evidence means.",
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
    body: "Ask learners to compare two possible actions and justify which is better supported by evidence.",
    confidence: "Medium",
  },
];
