import type { LessonContent, Locale3 } from "./catalog";
import { EN } from "./content-en";
import { HI } from "./content-hi";
import { MR } from "./content-mr";
import { GU } from "./content-gu";
import { TA } from "./content-ta";

export type FullLocale = Locale3 | "gu" | "ta";

/**
 * Localized lesson content. gu/ta ship full translations; te/kn/bn reuse
 * the fallback chain until theirs ship.
 */
const ALL: Record<string, Record<string, LessonContent>> = { en: EN, hi: HI, mr: MR, gu: GU, ta: TA };

const CHAINS: Record<string, string[]> = {
  mr: ["mr", "hi", "en"],
  hi: ["hi", "en"],
  en: ["en", "hi"],
  gu: ["gu", "hi", "en"],
  ta: ["ta", "hi", "en"],
  te: ["hi", "en"],
  kn: ["hi", "en"],
  bn: ["hi", "en"],
};

export function lessonContent(key: string, locale: string): LessonContent | null {
  const chain = CHAINS[locale] || ["hi", "en"];
  for (const l of chain) {
    const hit = ALL[l]?.[key];
    if (hit) return hit;
  }
  return null;
}

export function lessonLocales(): Locale3[] {
  return ["hi", "mr", "en"];
}
