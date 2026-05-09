import type { Learner } from "@/lib/types";

export const learners: Learner[] = [
  {
    id: "A104",
    score: 86,
    engagement: "High",
    reflection: "High",
    status: "Strong",
    completedAt: "May 30, 2025",
    timeSpentMin: 18.2,
  },
  {
    id: "B221",
    score: 58,
    engagement: "Low",
    reflection: "Low",
    status: "At risk",
    completedAt: "May 28, 2025",
    timeSpentMin: 12.4,
  },
  {
    id: "C087",
    score: 71,
    engagement: "Medium",
    reflection: "Medium",
    status: "Needs feedback",
    completedAt: "May 29, 2025",
    timeSpentMin: 15.1,
  },
  {
    id: "D330",
    score: 64,
    engagement: "Medium",
    reflection: "Low",
    status: "Needs feedback",
    completedAt: "May 27, 2025",
    timeSpentMin: 11.0,
  },
  {
    id: "E119",
    score: 91,
    engagement: "High",
    reflection: "High",
    status: "Strong",
    completedAt: "May 31, 2025",
    timeSpentMin: 21.5,
  },
];

export function getLearnerById(id: string) {
  return learners.find((l) => l.id === id);
}
