import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import {
  Fraunces,
  Mukta,
  Tiro_Devanagari_Hindi,
  Noto_Sans_Gujarati,
  Noto_Sans_Bengali,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Kannada,
} from "next/font/google";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ToastViewport } from "@/components/ui/Toast";
import { locales, type Locale } from "@/lib/i18n/config";

// Latin display. No Devanagari/Indic coverage — see per-script fonts below.
const display = Fraunces({ subsets: ["latin"], variable: "--font-display-latin", display: "swap" });
// Devanagari UI (hi/mr) + latin.
const sans = Mukta({ subsets: ["latin", "devanagari"], weight: ["400", "600", "700"], variable: "--font-sans-deva", display: "swap" });
// Devanagari display serif (hi/mr headlines + numbers pairing with Fraunces).
const devaDisplay = Tiro_Devanagari_Hindi({ subsets: ["latin", "devanagari"], weight: "400", variable: "--font-display-deva", display: "swap" });
// Scaffolded locales (gu/ta/te/kn/bn): full script coverage now, full
// translation + typographic tuning when each locale ships (before Phase 6).
const gu = Noto_Sans_Gujarati({ subsets: ["latin", "gujarati"], weight: ["400", "700"], variable: "--font-gu", display: "swap" });
const bn = Noto_Sans_Bengali({ subsets: ["latin", "bengali"], weight: ["400", "700"], variable: "--font-bn", display: "swap" });
const ta = Noto_Sans_Tamil({ subsets: ["latin", "tamil"], weight: ["400", "700"], variable: "--font-ta", display: "swap" });
const te = Noto_Sans_Telugu({ subsets: ["latin", "telugu"], weight: ["400", "700"], variable: "--font-te", display: "swap" });
const kn = Noto_Sans_Kannada({ subsets: ["latin", "kannada"], weight: ["400", "700"], variable: "--font-kn", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ojaisvini.vercel.app"),
  title: "Ojasvini — Bolo. Photo kheencho. Becho.",
  description: "Voice-first selling for rural women entrepreneurs. Speak. Snap. Sell.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.svg", apple: "/icons/icon-192.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F2A900",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Server reads her prefs cookies so first-paint HTML already carries the
 * right lang + theme + motion — no hydration mismatch, no theme flash.
 * (Client store stays authoritative after hydration and mirrors to cookies.)
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const rawLocale = jar.get("ojas_locale")?.value;
  const locale: Locale = (locales as readonly string[]).includes(rawLocale ?? "")
    ? (rawLocale as Locale)
    : "mr";
  const theme = jar.get("ojas_theme")?.value === "dark" ? "dark" : "light";
  const motion = jar.get("ojas_motion")?.value === "reduced" ? "reduced" : "full";

  return (
    <html
      lang={locale}
      data-locale={locale}
      data-theme={theme}
      data-motion={motion}
      className={`${display.variable} ${sans.variable} ${devaDisplay.variable} ${gu.variable} ${bn.variable} ${ta.variable} ${te.variable} ${kn.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:min-h-[48px] focus:rounded-full focus:bg-[var(--turmeric)] focus:px-5 focus:py-3 focus:font-bold focus:text-[var(--primary-ink)]"
        >
          Skip to content
        </a>
        <AppProviders>
          <OfflineBanner />
          {children}
          <ToastViewport />
        </AppProviders>
      </body>
    </html>
  );
}
