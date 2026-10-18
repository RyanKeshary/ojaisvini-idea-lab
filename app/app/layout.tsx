import { BottomNav } from "@/components/ui/BottomNav";
import { SideRail } from "@/components/ui/SideRail";
import { AssistantFab } from "@/components/ui/AssistantFab";
import { LanguageChip } from "@/components/ui/LanguageChip";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1200px]">
      <SideRail />
      <div className="min-w-0 flex-1 px-4 pb-28 pt-3 lg:px-8 lg:pb-10" id="main-content">
        {/* Universal Top App Bar with Language Selector */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)] border-opacity-50">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--turmeric)] text-[var(--primary-ink)] font-extrabold text-xs">
              ओ
            </span>
            <span className="font-extrabold text-base tracking-tight text-[var(--fg)]">
              ओजस्विनी
            </span>
          </div>
          <div className="hidden lg:block text-xs font-semibold opacity-60">
            ग्रामीण महिला उद्यमिता · Rural Women Micro-Enterprise
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <LanguageChip />
          </div>
        </div>

        {children}
      </div>
      <div className="lg:hidden">
        <BottomNav />
      </div>
      {/* Floating Sakhi Didi on every app screen (hidden on the assistant page). */}
      <AssistantFab />
    </div>
  );
}
