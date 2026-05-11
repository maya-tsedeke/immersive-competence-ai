import { ModuleIdGate } from "./ModuleIdGate";

/** Static export paths — custom modules use `/modules/view?mid=…`. */
export function generateStaticParams() {
  return [{ id: "new" }, { id: "tpl-workplace-safety" }];
}

export default function ModuleIdPage({ params }: { params: Promise<{ id: string }> }) {
  return <ModuleIdGate paramsPromise={params} />;
}
