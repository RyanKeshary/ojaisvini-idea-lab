import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import mr from "@/messages/mr.json";
import gu from "@/messages/gu.json";
import ta from "@/messages/ta.json";

function flat(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flat(v, prefix ? `${prefix}.${k}` : k)
  );
}

/** hi/mr/en/gu/ta must carry identical key sets (arrays count as leaves). */
describe("i18n parity (hi/mr/en/gu/ta)", () => {
  const enKeys = new Set(flat(en));
  for (const [locale, table] of Object.entries({ hi, mr, gu, ta })) {
    it(`${locale} matches en keys`, () => {
      const keys = new Set(flat(table));
      const missing = [...enKeys].filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !enKeys.has(k));
      expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    });
  }
});
