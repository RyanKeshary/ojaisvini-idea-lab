"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefs } from "@/lib/store/prefs";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";

/**
 * Responsive one-tap language switch.
 * Fully reactive on mobile & desktop with instant server & client re-render.
 */
export function LanguageChip() {
  const { locale, setLocale } = usePrefs();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (l: Locale) => {
    if (l === locale) return;
    // 1. Update client-side store
    setLocale(l);

    // 2. Synchronously write cookie so Next.js server component fetches pick it up
    document.cookie = `ojas_locale=${l}; path=/; max-age=31536000; samesite=lax`;

    // 3. Update HTML lang & data-locale attribute for immediate font/direction adjustments
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
      document.documentElement.dataset.locale = l;
    }

    // 4. Trigger Next.js App Router refresh to re-render all server components with new translations
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-full overflow-hidden" role="group" aria-label="Language selector">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 touch-pan-x scroll-smooth">
        {locales.map((l) => {
          const isSelected = locale === l;
          return (
            <button
              key={l}
              type="button"
              onClick={() => handleSelect(l)}
              aria-pressed={isSelected}
              disabled={isPending && isSelected}
              className={`relative flex items-center justify-center shrink-0 min-h-[38px] sm:min-h-[42px] px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-[var(--turmeric)] text-[var(--primary-ink)] border-2 border-[var(--turmeric)] shadow-xs scale-102"
                  : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--turmeric)] opacity-85 hover:opacity-100"
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={locale + l}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-ink)] animate-pulse shrink-0" aria-hidden />
                  )}
                  <span>{localeNames[l]}</span>
                </motion.span>
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}
