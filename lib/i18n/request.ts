import { getRequestConfig } from "next-intl/server";
import { fallbackChain, type Locale } from "./config";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import mr from "@/messages/mr.json";
import gu from "@/messages/gu.json";
import ta from "@/messages/ta.json";
import te from "@/messages/te.json";
import kn from "@/messages/kn.json";
import bn from "@/messages/bn.json";

const bundles: Record<string, unknown> = { en, hi, mr, gu, ta, te, kn, bn };

/**
 * NOTE (Phase 6): cookie locale is fine for the app shell, but the public
 * storefront (/shop/[slug]) needs SSR/ISR SEO. Before Phase 6, pair this
 * with a route-segment or accept-language locale + generateMetadata so
 * crawlers get per-locale tags/OG images instead of cookie-dependent HTML.
 */

/** Deep-merge fallback messages so scaffolded locales degrade gracefully. */
function deepMerge(base: unknown, over: unknown): unknown {
  if (typeof base !== "object" || base === null) {
    if (typeof over === "string" && over.trim() === "" && typeof base === "string" && base.trim() !== "") {
      return base;
    }
    return over ?? base;
  }
  if (typeof over !== "object" || over === null) return base;
  const out: Record<string, unknown> = { ...(base as object) };
  for (const [k, v] of Object.entries(over as object)) {
    if (typeof v === "string" && v.trim() === "" && typeof out[k] === "string" && (out[k] as string).trim() !== "") {
      // Retain non-empty base string
    } else {
      out[k] = k in out ? deepMerge(out[k], v) : v;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = ((await requestLocale) ?? "mr") as Locale;
  // next-intl scaffold: cookie `ojas_locale` wins when set (see providers).
  const { cookies, headers } = await import("next/headers");
  const jar = await cookies();
  const fromCookie = jar.get("ojas_locale")?.value as Locale | undefined;
  if (fromCookie) locale = fromCookie;
  void headers;
  let merged: unknown = {};
  for (const l of [...fallbackChain(locale)].reverse()) {
    let bundle = bundles[l];
    if (!bundle && l !== "en" && l !== "hi") {
      try {
        bundle = (await import(`@/messages/${l}.json`)).default;
      } catch {
        bundle = undefined;
      }
    }
    if (bundle) merged = deepMerge(merged, bundle);
  }
  return { locale, messages: merged as Record<string, Record<string, string>>, timeZone: "Asia/Kolkata" };
});
