import Link from "next/link";
import { Fragment } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth/config";
import { LanguageChip } from "@/components/ui/LanguageChip";
import { DownloadAppButton } from "@/components/marketing/DownloadAppButton";
import { ScrollCraftMount } from "@/components/marketing/ScrollCraftMount";
import { FilmPlayer } from "@/components/marketing/FilmPlayer";
import { SelfDemo } from "@/components/marketing/SelfDemo";
import { Mic, Camera, Store, Award, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import "@/styles/landing-engine.css";

/** Page-local strings that are not worth a messages key round-trip. */
type MicroCopy = {
  dashboardCta: string;
  downloadLabel: string;
  downloadSublabel: string;
};

const microCopy: Record<string, MicroCopy> = {
  en: { dashboardCta: "Open Dashboard", downloadLabel: "📲 Download App", downloadSublabel: "Install on phone" },
  hi: { dashboardCta: "डैशबोर्ड खोलें", downloadLabel: "📲 ऐप डाउनलोड करें", downloadSublabel: "फ़ोन में इंस्टॉल करें" },
  mr: { dashboardCta: "डॅशबोर्ड उघडा", downloadLabel: "📲 ॲप डाउनलोड करा", downloadSublabel: "फोनवर स्थापित करा" },
  gu: { dashboardCta: "ડેશબોર્ડ ખોલો", downloadLabel: "📲 એપ ડાઉનલોડ કરો", downloadSublabel: "ફોનમાં ઇન્સ્ટોલ કરો" },
  ta: { dashboardCta: "டாஷ்போர்டைத் திறக்கவும்", downloadLabel: "📲 செயலியைப் பதிவிறக்குக", downloadSublabel: "போனில் நிறுவுக" },
  te: { dashboardCta: "డాష్‌బోర్డ్ తెరవండి", downloadLabel: "📲 యాప్‌ను డౌన్‌లోడ్ చేయండి", downloadSublabel: "ఫోన్‌లో ఇన్‌స్టాల్ చేయండి" },
  kn: { dashboardCta: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ", downloadLabel: "📲 ಐಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", downloadSublabel: "ಫೋನ್‌ನಲ್ಲಿ ಸ್ಥಾಪಿಸಿ" },
  bn: { dashboardCta: "ড্যাশবোর্ড খুলুন", downloadLabel: "📲 অ্যাপ ডাউনলোড করুন", downloadSublabel: "ফোনে ইনস্টল করুন" },
};

const brandLetters: Record<string, string> = {
  en: "O", hi: "ओ", mr: "ओ", gu: "ઓ", ta: "ஓ", te: "ఓ", kn: "ಓ", bn: "ও",
};

/** Full-bleed measure: no max-width cap, small fixed gutters — the page uses
 *  the whole viewport width; only prose lines get their own max-width. */
const PAD = "px-4 sm:px-6 lg:px-8";

function graphemes(s: string, locale: string): string[] {
  try {
    return Array.from(new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(s), (x) => x.segment);
  } catch {
    return Array.from(s);
  }
}

/**
 * Ojasvini landing — scroll-craft build "ojasvini-launch" (grammar: launch
 * sheet). One light ground, type does the work (H1 at 125px), media only as
 * framed objects: the product film and a scroll-driven app mockup. Feeling
 * curve + gate: scrollcraft/builds/ojasvini-launch/BRIEF.md.
 */
export default async function LandingPage() {
  const rawLocale = await getLocale();
  const locale = (rawLocale in microCopy ? rawLocale : "en") as keyof typeof microCopy;
  const copy = microCopy[locale] || microCopy.en;
  const brandLetter = brandLetters[locale] || "O";

  const session = await auth();
  const isAuthed = !!session?.user?.id;
  const userName = session?.user?.name || "";
  const userRole = (session?.user as { role?: string })?.role;
  const dashboardHref =
    userRole === "ADMIN" ? "/admin" : userRole === "SAKHI" ? "/sakhi-console" : "/app/home";

  const t = await getTranslations("landing");
  const c = await getTranslations("common");
  const authT = await getTranslations("auth");

  const featureIcons = [Award, Mic, TrendingUp, Sparkles, Camera, ShieldCheck];
  const features = [0, 1, 2, 3, 4, 5].map((i) => ({
    t: t(`features.${i}.t`),
    d: t(`features.${i}.d`),
    Icon: featureIcons[i],
  }));

  const journeySteps = [0, 1, 2, 3, 4].map((i) => ({
    step: `0${i + 1}`,
    t: t(`journey.${i}.t`),
    d: t(`journey.${i}.d`),
  }));

  // The H1 is the product's tagline, split into word-scale pieces so each
  // word can arrive on its own beat.
  const h1Words = c("tagline").split(/\s+/).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: c("appName"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    offers: { "@type": "Offer", price: "0" },
    inLanguage: [locale],
    description: t("heroSub"),
  };

  const howTitle = t("howTitle");
  const featuresTitle = t("featuresTitle");

  return (
    <main data-surface="landing" className="weave-bg min-h-dvh" id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* No-JS: two things hide the page. (1) The engine's flow reveals start
          at opacity 0 and nothing ever adds .sc-in without its script.
          (2) React's streaming reveal parks the resolved page in `<div hidden>`
          and only its inline script un-deletes it — so a no-script reader is
          left staring at app/loading.tsx's skeleton forever. Show the parked
          content and drop the skeleton in its place.
          The display rules sit in @layer base on purpose: Tailwind preflight
          ships [hidden]{display:none!important} there, and !important reverses
          layer order — an unlayered !important loses to it. */}
      <noscript>
        <style>{`[data-sc-in],[data-sc-stagger]>*,[data-sc-cue]{opacity:1!important;transform:none!important}[data-sc-reveal]{clip-path:none!important}
@layer base{div[hidden]:has(>main){display:block!important}body>main{display:none!important}}`}</style>
      </noscript>

      <ScrollCraftMount />

      {/* ── top bar: chrome recedes, one action stays reachable ─────────── */}
      <header className={`ls-bar ${PAD}`}>
        <Link href="/" className="ls-mark">
          <span className="ls-mark__i" aria-hidden="true">
            {brandLetter}
          </span>
          <span className="ls-mark__t">{c("appName")}</span>
        </Link>

        <nav className="ls-nav" aria-label="Main">
          <Link href="#demo">{t("selfDemoTitle")}</Link>
          <Link href="#film">{t("filmTitle")}</Link>
          <Link href="#journey">{t("journeyTitle")}</Link>
          <Link href="#features">{featuresTitle}</Link>
        </nav>

        <div className="ls-bar__a">
          <LanguageChip />
          {isAuthed ? (
            <Link href={dashboardHref} className="btn btn--solid">
              <span className="max-w-[90px] truncate sm:max-w-none">{userName || copy.dashboardCta}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn--ghost">
                {authT("login")}
              </Link>
              <Link href="/auth/register" className="btn btn--solid">
                {t("start")}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── 1 · hero: the mechanic at 125px, nothing above it ───────────── */}
      <section id="top" className="ls-hero" aria-label={t("title")}>
        <h1 className="ls-h1" data-sc-parallax="-0.1">
          {h1Words.map((w, i) => (
            <Fragment key={i}>
              <span className="tw" style={{ animationDelay: `${120 + i * 90}ms` }}>
                {w}
              </span>
              {i < h1Words.length - 1 ? " " : ""}
            </Fragment>
          ))}
        </h1>

        <div className="ls-hero__row" data-sc-parallax="-0.03" data-sc-in data-sc-stagger="90">
          <p className="ls-hero__sub">{t("heroSub")}</p>
          <div className="ls-hero__cta">
            <Link
              href={isAuthed ? dashboardHref : "/auth/register"}
              className="btn btn--cta btn--lg"
            >
              {isAuthed ? copy.dashboardCta : t("start")}
            </Link>
            <Link href="#demo" className="btn btn--outline btn--lg">
              {t("howCta")}
            </Link>
          </div>
          <p className="ls-hero__trust">{t("trust")}</p>
        </div>
      </section>

      {/* ── 2 · the interactive signature experience: product demo ────── */}
      <section
        id="demo"
        data-sc-act="pin"
        data-sc-span="1.8"
        data-sc-dwell="0.4"
        aria-label={t("selfDemoTitle")}
        className="ls-demo"
      >
        <div className="sc-stage ls-demo__stage">
          <SelfDemo
            title={t("selfDemoTitle")}
            desc={t("demoDesc")}
            beats={[t("beat1"), t("beat2"), t("beat3")]}
          />
        </div>
      </section>

      {/* ── 3 · the product film: crisp 16:9 cinematic presentation ────── */}
      <section id="film" aria-label={t("filmTitle")}>
        <div className={`ls-head ${PAD}`}>
          <h2>{t("filmTitle")}</h2>
          <p>{t("filmDesc")}</p>
        </div>
        <div className={`ls-film-wrap ${PAD}`}>
          <div className="ls-film" data-sc-reveal="up">
            <FilmPlayer src="/films/ojasvini.mp4" poster="/films/ojasvini-poster.jpg" />
          </div>
        </div>
      </section>

      {/* ── 4 · what's inside: one quiet wave across the hairline grid ──── */}
      <section id="features" aria-label={featuresTitle}>
        <div className={`ls-head ${PAD}`}>
          <h2>{featuresTitle}</h2>
        </div>
        <ul className="ls-feat" data-sc-in data-sc-stagger="60">
          {features.map((f, i) => (
            <li key={i} className="ls-feat__i">
              <f.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 5.5 · interactive horizontal journey strip ───────────────────── */}
      <section id="journey" aria-label={t("journeyTitle")}>
        <div className={`ls-head ${PAD}`}>
          <h2>{t("journeyTitle")}</h2>
          <p>{c("taglineDesc")}</p>
        </div>
        <div className="ls-strip-track no-scrollbar" role="region" aria-label="Journey stages carousel">
          {journeySteps.map((s, idx) => (
            <div key={idx} className="ls-strip-card" tabIndex={0}>
              <div>
                <span className="ls-strip-card__badge">
                  <span>Step {s.step}</span>
                </span>
                <h3 className="ls-strip-card__title">{s.t}</h3>
                <p className="ls-strip-card__desc">{s.d}</p>
              </div>
              <div className="ls-strip-card__foot">
                <span>Phase {idx + 1}</span>
                <span aria-hidden="true">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6 · close: one line, one orange button, then quiet ──────────── */}
      <section id="start" aria-label={t("start")}>
        <div className={`ls-close ${PAD}`}>
          <h2 className="ls-close__line">{t("closeLine")}</h2>
          <div className="ls-close__cta">
            <Link
              href={isAuthed ? dashboardHref : "/auth/register"}
              className="btn btn--cta btn--lg"
            >
              {isAuthed ? copy.dashboardCta : t("start")}
            </Link>
            <DownloadAppButton
              label={copy.downloadLabel}
              sublabel={copy.downloadSublabel}
              className="min-h-[46px]"
            />
          </div>
          <p className="ls-close__note">{c("demoHint")}</p>

          <footer className="ls-foot">
            <div className="ls-foot__brand">
              <span className="font-bold">{c("appName")}</span>
              <span aria-hidden="true">·</span>
              <span>{t("footer")}</span>
            </div>
            <nav className="ls-foot__links" aria-label="Footer">
              <Link href="#demo">{t("selfDemoTitle")}</Link>
              <Link href="#film">{t("filmTitle")}</Link>
              <Link href="#journey">{t("journeyTitle")}</Link>
              <Link href="#features">{featuresTitle}</Link>
              <Link href="/auth/staff">Sakhi / Staff Login</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/offline">Offline</Link>
            </nav>
          </footer>
        </div>
      </section>
    </main>
  );
}
