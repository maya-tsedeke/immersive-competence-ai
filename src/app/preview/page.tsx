import { PreviewLearnerShell } from "@/components/preview/PreviewLearnerShell";
import { PreviewScenarioClient } from "@/components/preview/PreviewScenarioClient";

export default function PreviewPage() {
  return (
    <PreviewLearnerShell>
      <PreviewScenarioClient />
    </PreviewLearnerShell>
  );
}
