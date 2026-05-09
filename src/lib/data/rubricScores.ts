import type { RubricRow } from "@/lib/types";

export const rubricByLearner: Record<string, RubricRow[]> = {
  B221: [
    { criterion: "Observation", rating: "Good" },
    { criterion: "Decision-making", rating: "Developing" },
    { criterion: "Justification", rating: "Needs support" },
    { criterion: "Reflection", rating: "Good" },
  ],
  A104: [
    { criterion: "Observation", rating: "Good" },
    { criterion: "Decision-making", rating: "Good" },
    { criterion: "Justification", rating: "Good" },
    { criterion: "Reflection", rating: "Good" },
  ],
  C087: [
    { criterion: "Observation", rating: "Good" },
    { criterion: "Decision-making", rating: "Developing" },
    { criterion: "Justification", rating: "Developing" },
    { criterion: "Reflection", rating: "Developing" },
  ],
  D330: [
    { criterion: "Observation", rating: "Developing" },
    { criterion: "Decision-making", rating: "Developing" },
    { criterion: "Justification", rating: "Needs support" },
    { criterion: "Reflection", rating: "Developing" },
  ],
  E119: [
    { criterion: "Observation", rating: "Good" },
    { criterion: "Decision-making", rating: "Good" },
    { criterion: "Justification", rating: "Good" },
    { criterion: "Reflection", rating: "Good" },
  ],
};

export function getRubricForLearner(learnerId: string): RubricRow[] {
  return (
    rubricByLearner[learnerId] ?? [
      { criterion: "Observation", rating: "Developing" },
      { criterion: "Decision-making", rating: "Developing" },
      { criterion: "Justification", rating: "Developing" },
      { criterion: "Reflection", rating: "Developing" },
    ]
  );
}
