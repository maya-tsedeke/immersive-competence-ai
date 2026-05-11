"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export function ModuleIdGate({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise);
  const router = useRouter();
  useEffect(() => {
    if (id === "new") router.replace("/modules");
    else router.replace(`/modules/view?mid=${encodeURIComponent(id)}`);
  }, [id, router]);
  return (
    <div className="p-8 text-center text-sm text-slate-600" role="status">
      Opening module…
    </div>
  );
}
