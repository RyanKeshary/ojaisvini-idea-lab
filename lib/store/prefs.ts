import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n/config";

export const PREF_COOKIES = ["ojas_locale", "ojas_theme", "ojas_motion"] as const;

type Prefs = {
  locale: Locale;
  theme: "light" | "dark";
  reduceMotion: boolean;
  dataSaver: boolean;
  voiceSpeed: number;
  textSize: "base" | "plus" | "plusplus";
  setLocale: (l: Locale) => void;
  setTheme: (t: "light" | "dark") => void;
  setReduceMotion: (v: boolean) => void;
  setDataSaver: (v: boolean) => void;
  setVoiceSpeed: (v: number) => void;
  setTextSize: (v: Prefs["textSize"]) => void;
};

/**
 * Mirror prefs to cookies so the SERVER layout can render matching
 * <html lang>/data-* attributes on first paint (no hydration mismatch,
 * no theme flash). Read server-side via next/headers cookies().
 */
function syncCookies(p: { locale: Locale; theme: string; reduceMotion: boolean }) {
  if (typeof document === "undefined") return;
  const pairs = [
    `ojas_locale=${p.locale}`,
    `ojas_theme=${p.theme}`,
    `ojas_motion=${p.reduceMotion ? "reduced" : "full"}`,
  ];
  for (const kv of pairs) {
    document.cookie = `${kv}; path=/; max-age=31536000; samesite=lax`;
  }
}

export const usePrefs = create<Prefs>()(
  persist(
    (set, get) => ({
      locale: "mr",
      theme: "light",
      reduceMotion: false,
      dataSaver: false,
      voiceSpeed: 1,
      textSize: "base",
      setLocale: (locale) => {
        set({ locale });
        syncCookies({ ...get(), locale });
      },
      setTheme: (theme) => {
        set({ theme });
        syncCookies({ ...get(), theme });
      },
      setReduceMotion: (reduceMotion) => {
        set({ reduceMotion });
        syncCookies({ ...get(), reduceMotion });
      },
      setDataSaver: (dataSaver) => set({ dataSaver }),
      setVoiceSpeed: (voiceSpeed) => set({ voiceSpeed }),
      setTextSize: (textSize) => set({ textSize }),
    }),
    { name: "ojas-prefs" }
  )
);
