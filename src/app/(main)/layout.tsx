import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { isUsingGeneratedData } from "@/lib/dataset";

export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mlBaseline = isUsingGeneratedData();
  return (
    <AppShell>
      <TopBar showMlBaselineBadge={mlBaseline} />
      <main className="flex-1 px-4 py-6 pb-28 md:px-8 md:pb-10">{children}</main>
    </AppShell>
  );
}
