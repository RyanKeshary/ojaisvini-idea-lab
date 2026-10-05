import { BottomNav } from "@/components/ui/BottomNav";
import { SideRail } from "@/components/ui/SideRail";
import { AssistantFab } from "@/components/ui/AssistantFab";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1200px]">
      <SideRail />
      <div className="min-w-0 flex-1 px-4 pb-28 pt-4 lg:px-8 lg:pb-10" id="main-content">{children}</div>
      <div className="lg:hidden">
        <BottomNav />
      </div>
      {/* Floating Sakhi Didi on every app screen (hidden on the assistant page). */}
      <AssistantFab />
    </div>
  );
}
