import { ScenarioAnalyticsWorkspace } from "@/components/analytics/ScenarioAnalyticsWorkspace";
import { getLearners, getScenarioAnalytics } from "@/lib/dataset";

export default function ScenarioAnalyticsPage() {
  const sa = getScenarioAnalytics();
  const learners = getLearners();

  return <ScenarioAnalyticsWorkspace sa={sa} learners={learners} />;
}
