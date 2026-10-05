import { describe, expect, it } from "vitest";
import { JOURNEYS, LESSON_BADGE, BADGES } from "@/lib/learn/catalog";
import { EN } from "@/lib/learn/content-en";
import { HI } from "@/lib/learn/content-hi";
import { MR } from "@/lib/learn/content-mr";
import { GU } from "@/lib/learn/content-gu";
import { TA } from "@/lib/learn/content-ta";

const LOCALES = { en: EN, hi: HI, mr: MR, gu: GU, ta: TA };
const ALL_KEYS = JOURNEYS.flatMap((j) => j.lessons);

describe("learning catalog", () => {
  it("has 24 lessons across 8 journeys", () => {
    expect(JOURNEYS).toHaveLength(8);
    expect(ALL_KEYS).toHaveLength(24);
  });
  it("every lesson is complete in hi/mr/en/gu/ta", () => {
    for (const [locale, table] of Object.entries(LOCALES)) {
      for (const key of ALL_KEYS) {
        const l = table[key];
        expect(l, `${locale}:${key}`).toBeDefined();
        expect(l.title.length, `${locale}:${key} title`).toBeGreaterThan(2);
        expect(l.cards.length, `${locale}:${key} cards`).toBeGreaterThanOrEqual(3);
        for (const c of l.cards) {
          expect(c.icon, `${locale}:${key} card icon`).toBeTruthy();
          expect(c.text.length, `${locale}:${key} card text`).toBeGreaterThan(5);
        }
        expect(l.task.instruction.length, `${locale}:${key} task`).toBeGreaterThan(5);
        expect(l.quiz.options, `${locale}:${key} options`).toHaveLength(3);
        expect(l.quiz.answer, `${locale}:${key} answer`).toBeGreaterThanOrEqual(0);
        expect(l.quiz.answer, `${locale}:${key} answer`).toBeLessThanOrEqual(2);
      }
    }
  });
  it("badge references resolve", () => {
    for (const code of Object.values(LESSON_BADGE)) {
      expect(BADGES[code], code).toBeDefined();
    }
  });
});
