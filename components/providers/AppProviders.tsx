"use client";
import { MotionConfig } from "framer-motion";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { registerSW } from "@/lib/pwa/install";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrefs } from "@/lib/store/prefs";
import type { Locale } from "@/lib/i18n/config";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import mr from "@/messages/mr.json";
import gu from "@/messages/gu.json";
import ta from "@/messages/ta.json";
import te from "@/messages/te.json";
import kn from "@/messages/kn.json";
import bn from "@/messages/bn.json";

const bundles: Record<string, unknown> = { en, hi, mr, gu, ta, te, kn, bn };

function merge(base: unknown, over: unknown): unknown {
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
      // Retain base
    } else {
      out[k] = k in out ? merge(out[k], v) : v;
    }
  }
  return out;
}

function messagesFor(locale: string) {
  const chain = locale === "en" ? ["en"] : locale === "hi" ? ["hi", "en"] : [locale, "hi", "en"];
  let m: unknown = {};
  for (const l of [...chain].reverse()) if (bundles[l]) m = merge(m, bundles[l]);
  return m as never;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { locale, theme, reduceMotion, dataSaver } = usePrefs();
  const [qc] = useState(() => new QueryClient());
  const router = useRouter();

  // Real-time synchronization across all open browser tabs
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("ojas-pref-sync");
        bc.onmessage = (event) => {
          if (event.data?.type === "LOCALE_CHANGE" && event.data.locale) {
            const newLoc = event.data.locale as Locale;
            if (newLoc && newLoc !== usePrefs.getState().locale) {
              usePrefs.getState().setLocale(newLoc, false);
              router.refresh();
            }
          }
        };
      }
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === "ojas-prefs" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const newLoc = parsed.state?.locale as Locale;
          if (newLoc && newLoc !== usePrefs.getState().locale) {
            usePrefs.getState().setLocale(newLoc, false);
            router.refresh();
          }
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      bc?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [router]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.motion = reduceMotion ? "reduced" : "full";
    // Keep <html lang> and per-script font stacks in sync with her language.
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.documentElement.dataset.saver = dataSaver ? "1" : "0";
    registerSW();
  }, [theme, reduceMotion, locale, dataSaver]);

  return (
    <QueryClientProvider client={qc}>
      <SessionProvider>
        <NextIntlClientProvider locale={locale} messages={messagesFor(locale)} timeZone="Asia/Kolkata">
          <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>{children}</MotionConfig>
        </NextIntlClientProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
