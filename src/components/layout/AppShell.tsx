import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        {children}
      </div>
      <MobileBottomNav />
    </div>
  );
}
