import type { Scenario } from "@/lib/types";

export const scenarios: Scenario[] = [
  {
    id: "workplace-safety",
    title: "Workplace Safety Simulation",
    description:
      "360° warehouse scenario teaching hazard observation, decision-making, and reflection.",
  },
];

export const defaultScenarioId = scenarios[0].id;
