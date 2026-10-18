"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import { usePrefs } from "@/lib/store/prefs";
import { localeNames, locales, type Locale } from "@/lib/i18n/config";

/**
 * Dropdown Menu for Language Selection.
 * Replaces the horizontal navbar with an elegant, compact dropdown menu.
 * Fully reactive on mobile & desktop with instant server & client re-render.
 */
export function LanguageChip() {
  const { locale, setLocale } = usePrefs();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (l: Locale) => {
    setIsOpen(false);
    if (l === locale) return;

    // 1. Update client-side store
    setLocale(l);

    // 2. Synchronously write cookie so Next.js server components pick it up
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

  const currentLabel = localeNames[locale] || "English";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLabel}. Click to change language.`}
        className="inline-flex min-h-[38px] sm:min-h-[40px] items-center gap-2 rounded-full border bg-[var(--card)] px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[var(--fg)] shadow-xs transition-all hover:border-[var(--turmeric)] hover:shadow-sm active:scale-95"
        style={{ borderColor: "var(--border)" }}
      >
        <Globe className="h-4 w-4 text-[var(--accent)] shrink-0" aria-hidden />
        <span className="font-bold tracking-tight">{currentLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
        {isPending && (
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--turmeric)] animate-ping shrink-0" />
        )}
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-48 sm:w-52 rounded-2xl border bg-[var(--card)] p-1.5 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60 border-b border-[var(--border)] border-opacity-50 mb-1">
            भाषा चुनें · Select Language
          </div>

          <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
            {locales.map((l) => {
              const isSelected = locale === l;
              return (
                <button
                  key={l}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(l)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-colors text-left ${
                    isSelected
                      ? "bg-[var(--turmeric)] text-[var(--primary-ink)] font-bold shadow-xs"
                      : "text-[var(--fg)] hover:bg-black/5 dark:hover:bg-white/5 opacity-85 hover:opacity-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{localeNames[l]}</span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-[var(--primary-ink)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
