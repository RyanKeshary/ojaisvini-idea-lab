"use client";
import { useTranslations } from "next-intl";
import { LanguageChip } from "@/components/ui/LanguageChip";

export function TopAppBar() {
  const c = useTranslations("common");

  return (
    <header className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border)] border-opacity-50">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--turmeric)] text-[var(--primary-ink)] font-extrabold text-xs shadow-xs">
          {c("appName").charAt(0)}
        </span>
        <span className="font-extrabold text-base tracking-tight text-[var(--fg)]">
          {c("appName")}
        </span>
      </div>
      <div className="hidden lg:block text-xs font-semibold opacity-70 text-[var(--fg)]">
        {c("taglineDesc")}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <LanguageChip />
      </div>
    </header>
  );
}
