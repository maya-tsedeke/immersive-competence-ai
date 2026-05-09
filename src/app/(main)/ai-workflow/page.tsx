import { AiWorkflowClient } from "@/app/(main)/ai-workflow/AiWorkflowClient";
import { usingGeneratedData } from "@/lib/dataset";

export default function AiWorkflowPage() {
  return <AiWorkflowClient usingGeneratedJson={usingGeneratedData()} />;
}
