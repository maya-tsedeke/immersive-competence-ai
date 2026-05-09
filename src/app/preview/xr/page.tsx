import { PreviewLearnerShell } from "@/components/preview/PreviewLearnerShell";
import { XRScenarioViewer } from "@/components/xr/XRScenarioViewer";

export default function PreviewXRPage() {
  return (
    <PreviewLearnerShell>
      <XRScenarioViewer variant="mobile" guidedPreview />
    </PreviewLearnerShell>
  );
}
