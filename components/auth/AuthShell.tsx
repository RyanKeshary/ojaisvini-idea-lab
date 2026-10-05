import { OjasDidi } from "@/components/ui/OjasDidi";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { LanguageChip } from "@/components/ui/LanguageChip";

/** Auth shell: single column on mobile; illustration + form split on desktop. */
export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="weave-bg mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-5 px-5 pb-10 pt-8 lg:flex-row lg:items-start lg:gap-10" id="main-content">
      <div className="flex w-full max-w-md flex-col gap-5 lg:sticky lg:top-8 lg:flex-1">
        <LanguageChip />
        <div className="flex items-center gap-3">
          <OjasDidi mood="greeting" size={72} />
          <h1 className="display text-3xl font-bold">{title}</h1>
        </div>
        {/* Desktop illustration panel (decorative; form carries the meaning). */}
        <div aria-hidden className="hidden flex-col items-center gap-3 rounded-[28px] border bg-[var(--card)] p-8 text-center lg:flex" style={{ borderColor: "var(--border)" }}>
          <VoiceOrb state="idle" size={110} label="" />
          <p className="display text-2xl font-bold">Bolo. Photo kheencho. Becho.</p>
          <OjasDidi mood="listening" size={96} />
        </div>
      </div>
      <div className="flex w-full max-w-md flex-col gap-5 lg:flex-1 lg:pt-24">{children}</div>
    </main>
  );
}
