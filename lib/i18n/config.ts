export const locales = ["mr", "hi", "gu", "ta", "te", "kn", "bn", "en"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  mr: "मराठी",
  hi: "हिन्दी",
  gu: "ગુજરાતી",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  bn: "বাংলা",
  en: "English",
};

/** BCP-47 tags for Web Speech STT/TTS per locale. */
export const speechCodes: Record<Locale, string> = {
  mr: "mr-IN",
  hi: "hi-IN",
  gu: "gu-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  bn: "bn-IN",
  en: "en-IN",
};

/** Fallback chain: xx -> hi -> en (mr/hi/en ship complete in Phase 1). */
export function fallbackChain(locale: Locale): Locale[] {
  if (locale === "hi") return ["hi", "en"];
  if (locale === "en") return ["en", "hi"];
  return [locale, "hi", "en"];
}
