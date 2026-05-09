import { PreviewLearnerShell } from "@/components/preview/PreviewLearnerShell";
import { XRScenarioViewer } from "@/components/xr/XRScenarioViewer";

export default async function PreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ learner?: string }>;
}) {
  const q = searchParams ? await searchParams : {};
  const learnerId = q.learner?.trim();
  return (
    <PreviewLearnerShell>
      <XRScenarioViewer variant="mobile" guidedPreview scenarioLearnerId={learnerId} />
    </PreviewLearnerShell>
  );
}
