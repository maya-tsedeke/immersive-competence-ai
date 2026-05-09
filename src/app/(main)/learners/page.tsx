import { LearnersView } from "@/components/learners/LearnersView";
import { getLearners, getPredictionCohortCounts, usingGeneratedData } from "@/lib/dataset";

export default function LearnersPage() {
  const learners = getLearners();
  const cohortCounts = getPredictionCohortCounts();
  return (
    <LearnersView
      learners={learners}
      cohortCounts={cohortCounts}
      usingGeneratedJson={usingGeneratedData()}
    />
  );
}