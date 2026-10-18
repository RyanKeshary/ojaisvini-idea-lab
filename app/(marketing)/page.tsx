import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { ListenButton } from "@/components/voice/ListenButton";
import { LanguageChip } from "@/components/ui/LanguageChip";
import { OjasDidi } from "@/components/ui/OjasDidi";
import { Reveal } from "@/components/marketing/Reveal";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { DownloadAppButton } from "@/components/marketing/DownloadAppButton";
import {
  Mic,
  Camera,
  Store,
  WifiOff,
  Languages,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/**
 * Landing Page: Professional, clean, responsive across laptop and mobile devices.
 * Features voice-first rural commerce, instant PWA app download, and grounded impact.
 */
export default async function LandingPage() {
  const session = await auth();
  const isAuthed = !!session?.user?.id;
  const userName = session?.user?.name || "दीदी";
  const userRole = (session?.user as { role?: string })?.role;
  const dashboardHref =
    userRole === "ADMIN" ? "/admin" : userRole === "SAKHI" ? "/sakhi-console" : "/app/home";

  const t = await getTranslations("landing");
  const c = await getTranslations("common");
  const pwaT = await getTranslations("pwa");

  const sample = await db.shop.findFirst({
    where: { isLive: true, products: { some: { status: "LIVE" } } },
    select: { slug: true, name: true },
  });

  const steps = [
    {
      icon: <Mic className="h-6 w-6 text-amber-500" />,
      title: t("steps.0.t"),
      desc: t("steps.0.d"),
    },
    {
      icon: <Camera className="h-6 w-6 text-teal-600" />,
      title: t("steps.1.t"),
      desc: t("steps.1.d"),
    },
    {
      icon: <Store className="h-6 w-6 text-indigo-600" />,
      title: t("steps.2.t"),
      desc: t("steps.2.d"),
    },
  ];

  const journey = [0, 1, 2, 3, 4].map((i) => ({
    t: t(`journey.${i}.t`),
    d: t(`journey.${i}.d`),
  }));

  const featureIcons = [
    <Award key="0" className="h-5 w-5 text-teal-600" />,
    <Mic key="1" className="h-5 w-5 text-amber-500" />,
    <TrendingUp key="2" className="h-5 w-5 text-emerald-600" />,
    <Sparkles key="3" className="h-5 w-5 text-indigo-500" />,
    <Camera key="4" className="h-5 w-5 text-teal-600" />,
    <ShieldCheck key="5" className="h-5 w-5 text-blue-600" />,
    <Store key="6" className="h-5 w-5 text-purple-600" />,
  ];

  const features = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
    t: t(`features.${i}.t`),
    d: t(`features.${i}.d`),
    icon: featureIcons[i],
  }));

  const story = [0, 1, 2, 3, 4].map((i) => ({ d: t(`story.${i}.d`), t: t(`story.${i}.t`) }));
  const stats = [0, 1, 2].map((i) => ({ v: t(`stats.${i}.v`), d: t(`stats.${i}.d`) }));
  const faqs = [0, 1, 2, 3].map((i) => ({ q: t(`faq.${i}.q`), a: t(`faq.${i}.a`) }));
  const whyRows = [0, 1, 2, 3].map((i) => [
    t(`why.rows.${i}.0`),
    t(`why.rows.${i}.1`),
    t(`why.rows.${i}.2`),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Ojasvini",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    offers: { "@type": "Offer", price: "0" },
    inLanguage: ["hi", "mr", "en", "gu", "ta"],
  };

  return (
    <main
      className="weave-bg mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-12 sm:gap-20 px-4 sm:px-6 lg:px-8 pb-20 pt-3 sm:pt-5"
      id="main-content"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Sleek Navigation Header */}
      <header
        className="sticky top-3 z-30 flex items-center justify-between gap-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-4 sm:px-5 py-3 border shadow-xs"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--turmeric)] text-[var(--primary-ink)] font-extrabold text-base shadow-xs group-hover:scale-105 transition-transform">
            ओ
          </span>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-[var(--fg)]">
              ओजस्विनी
            </span>
            <span className="text-[10px] sm:text-xs font-semibold opacity-70 leading-none mt-0.5">
              Ojasvini
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation (Laptop / Desktop only) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[var(--fg)] opacity-80" aria-label="Main Navigation">
          <Link href="#how" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            {t("howTitle")}
          </Link>
          <Link href="#features" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            {t("featuresTitle")}
          </Link>
          <Link href="#why" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            {t("whyTitle")}
          </Link>
          <Link href="#story" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            {t("storyTitle")}
          </Link>
          <Link href="#faq" className="hover:opacity-100 hover:text-[var(--accent)] transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Language selector & Auth CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageChip />

          {isAuthed ? (
            <Link
              href={dashboardHref}
              className="flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--turmeric)] px-4 text-xs sm:text-sm font-bold text-[var(--primary-ink)] shadow-xs transition-transform active:scale-95 hover:opacity-90 shrink-0"
            >
              <span>🏪</span>
              <span className="truncate max-w-[120px] sm:max-w-none">{userName}</span>
              <span>→</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border bg-[var(--card)] hover:border-[var(--turmeric)] text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
                style={{ borderColor: "var(--border)" }}
              >
                लॉगिन
              </Link>
              <Link
                href="/auth/register"
                className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[var(--turmeric)] text-[var(--primary-ink)] text-xs sm:text-sm font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all shrink-0"
              >
                {t("start")}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 2. Responsive Hero Section (Laptop 2-column, Mobile 1-column) */}
      <section
        className="relative pt-2 sm:pt-6 lg:pt-8"
        aria-label={t("title")}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (Copy, CTAs, Audio accessibility) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            {/* National Initiative Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs px-3.5 py-1.5 border shadow-xs text-xs font-semibold text-stone-700 dark:text-stone-300" style={{ borderColor: "var(--border)" }}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Digital Commerce for Rural Women Micro-Entrepreneurs</span>
            </div>

            {/* Main Headline */}
            <h1 className="display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--fg)] leading-[1.15]">
              {t("title")}
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-bold mt-1.5" style={{ color: "var(--accent)" }}>
                {c("tagline")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-[46ch] text-base sm:text-lg opacity-80 leading-relaxed font-normal">
              {t("subtitle")}
            </p>

            {/* Voice Accessibility Listen Button */}
            <div className="flex items-center gap-2">
              <ListenButton text={`${t("title")}. ${c("tagline")}. ${t("subtitle")}`} />
              <span className="text-xs opacity-60 font-medium">Click to hear aloud (सुनें)</span>
            </div>

            {/* Primary Action Buttons & Download App */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2">
              {isAuthed ? (
                <Link
                  href={dashboardHref}
                  className="flex min-h-[52px] sm:min-h-[58px] items-center justify-center rounded-2xl bg-[var(--turmeric)] px-6 text-base sm:text-lg font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all"
                >
                  🏪 Continue to Your Shop ({userName}) →
                </Link>
              ) : (
                <Link
                  href="/auth/register"
                  className="flex min-h-[52px] sm:min-h-[58px] items-center justify-center gap-2 rounded-2xl bg-[var(--turmeric)] px-6 text-base sm:text-lg font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all text-center"
                >
                  <span>{t("start")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {/* Download App on Phone Button */}
              <DownloadAppButton
                label="📲 Download App"
                sublabel="Install on your phone"
              />
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-900/60 px-3 py-1 border shadow-xs" style={{ borderColor: "var(--border)" }}>
                <Mic className="h-3.5 w-3.5 text-amber-500" /> Voice-First
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-900/60 px-3 py-1 border shadow-xs" style={{ borderColor: "var(--border)" }}>
                <Camera className="h-3.5 w-3.5 text-teal-600" /> Photo AI Listing
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-900/60 px-3 py-1 border shadow-xs" style={{ borderColor: "var(--border)" }}>
                <Languages className="h-3.5 w-3.5 text-indigo-600" /> 8 Indian Languages
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-900/60 px-3 py-1 border shadow-xs" style={{ borderColor: "var(--border)" }}>
                <WifiOff className="h-3.5 w-3.5 text-rose-500" /> Works Offline
              </span>
            </div>

            {/* Trust statement */}
            <p className="text-xs opacity-65 pt-1">{t("trust")}</p>
          </div>

          {/* Right Column (High-Fidelity Smartphone Mockup with live interactive preview) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <PhoneMockup speak={t("speak")} snap={t("snap")} sell={t("sell")} />
          </div>
        </div>
      </section>

      {/* 3. Problem & Impact Statistics */}
      <Reveal>
        <section aria-label={t("problemTitle")}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                Grassroots Reality
              </span>
              <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">
                {t("problemTitle")}
              </h2>
            </div>
            <p className="text-xs opacity-50">{t("illustrative")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <article key={s.v} className="card-simple p-6 rounded-2xl flex flex-col justify-between">
                <p className="display text-3xl sm:text-4xl font-extrabold" style={{ color: "var(--accent)" }}>
                  {s.v}
                </p>
                <p className="mt-2 text-sm sm:text-base opacity-80 font-medium leading-snug">
                  {s.d}
                </p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 4. How It Works (3 Steps) */}
      <Reveal>
        <section id="how" aria-label={t("howTitle")} className="scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Simplicity by Design
            </span>
            <h2 className="display text-2xl sm:text-4xl font-bold tracking-tight mt-1">
              {t("howTitle")}
            </h2>
            <p className="text-sm opacity-75 mt-2">
              Three effortless steps designed specifically for women with zero technical background.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {steps.map((s, idx) => (
              <article
                key={s.title}
                className="card-simple p-6 sm:p-7 text-center flex flex-col items-center rounded-2xl relative group hover:border-[var(--turmeric)] transition-colors"
              >
                <span className="absolute top-4 right-4 text-xs font-extrabold opacity-30 group-hover:opacity-60 transition-opacity">
                  0{idx + 1}
                </span>
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--clay-soft)]/60 text-3xl mb-4 shadow-inner group-hover:scale-110 transition-transform">
                  {s.icon}
                </span>
                <h3 className="display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm opacity-75 leading-relaxed">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 5. Journey: From Onboarding to Independent Micro-Enterprise */}
      <Reveal>
        <section aria-label={t("journeyTitle")}>
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Her Empowerment Path
            </span>
            <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">
              {t("journeyTitle")}
            </h2>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {journey.map((j, i) => (
              <li
                key={j.t}
                className="card-simple flex flex-col p-4 sm:p-5 rounded-2xl justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl font-bold text-xs text-[var(--primary-ink)] bg-[var(--turmeric)] shadow-xs">
                    0{i + 1}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">
                    Step {i + 1}
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold text-[var(--fg)]">{j.t}</p>
                  <p className="text-xs sm:text-sm opacity-70 leading-snug mt-1">{j.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* 6. Comprehensive Platform Features Grid */}
      <Reveal>
        <section id="features" aria-label={t("featuresTitle")} className="scroll-mt-20">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Full Ecosystem
            </span>
            <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">
              {t("featuresTitle")}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.t}
                className="card-simple p-5 sm:p-6 rounded-2xl flex flex-col gap-2 hover:border-[var(--turmeric)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--clay-soft)]/70">
                    {f.icon}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--fg)]">{f.t}</h3>
                </div>
                <p className="text-sm opacity-75 leading-relaxed pt-1">{f.d}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 7. Why Ojasvini is Different (Comparison Table) */}
      <Reveal>
        <section id="why" aria-label={t("whyTitle")} className="scroll-mt-20">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Fair Comparison
            </span>
            <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">
              {t("whyTitle")}
            </h2>
          </div>

          <div
            className="overflow-x-auto rounded-2xl border bg-[var(--card)] shadow-xs"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="bg-[var(--clay-soft)]/70 border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="p-4 font-bold text-[var(--primary-ink)]" scope="col">
                    {t("whyCols.0")}
                  </th>
                  <th className="p-4 font-bold opacity-75" scope="col">
                    {t("whyCols.1")}
                  </th>
                  <th className="p-4 font-bold opacity-75" scope="col">
                    {t("whyCols.2")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {whyRows.map((r, i) => (
                  <tr
                    key={i}
                    className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                  >
                    <td className="p-4 font-bold text-[var(--fg)] flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> {r[0]}
                    </td>
                    <td className="p-4 opacity-75">{r[1]}</td>
                    <td className="p-4 opacity-75">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* 8. Ryani's Story & Impact */}
      <Reveal>
        <section
          id="story"
          aria-label={t("storyTitle")}
          className="card-simple bg-gradient-to-br from-white/95 to-[var(--clay-soft)]/40 dark:from-stone-900/90 dark:to-stone-900/40 p-6 sm:p-8 rounded-3xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <OjasDidi mood="celebrating" size={68} />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                Field Experience
              </span>
              <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">
                {t("storyTitle")}
              </h2>
            </div>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {story.map((s) => (
              <li
                key={s.d}
                className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white/70 dark:bg-stone-800/60 border border-[var(--border)]"
              >
                <span
                  aria-hidden
                  className="font-bold text-sm tracking-tight"
                  style={{ color: "var(--accent)" }}
                >
                  {s.d}
                </span>
                <span className="text-xs sm:text-sm opacity-85 leading-relaxed">{s.t}</span>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* 9. SDG Alignment & Impact */}
      <Reveal>
        <section
          id="impact"
          aria-label={t("impactTitle")}
          className="card-simple p-6 sm:p-8 text-center rounded-3xl scroll-mt-20"
        >
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">
            {t("impactTitle")}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="rounded-full bg-[var(--clay-soft)] px-3.5 py-1 text-xs font-bold text-[var(--turmeric)]">
              SDG 4: Quality Education
            </span>
            <span className="rounded-full bg-[var(--clay-soft)] px-3.5 py-1 text-xs font-bold text-[var(--turmeric)]">
              SDG 8: Decent Work
            </span>
            <span className="rounded-full bg-[var(--clay-soft)] px-3.5 py-1 text-xs font-bold text-[var(--turmeric)]">
              SDG 9: Industry & Innovation
            </span>
          </div>
          <p className="mt-3 text-sm sm:text-base opacity-80 max-w-xl mx-auto leading-relaxed">
            {t("impactLine")}
          </p>
        </section>
      </Reveal>

      {/* 10. Interactive Live Demo Banner */}
      <Reveal>
        <section
          aria-label={t("demoTitle")}
          className="card-simple border-2 p-6 sm:p-8 text-center relative overflow-hidden rounded-3xl"
          style={{ borderColor: "var(--turmeric)" }}
        >
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">
            {t("demoTitle")}
          </h2>
          <p className="mt-2 text-sm sm:text-base opacity-75 max-w-md mx-auto">
            {t("demoOtpNote")}
          </p>
          <div className="mx-auto mt-5 flex max-w-sm flex-col gap-3">
            <Link
              href="/auth/login"
              className="flex min-h-[54px] items-center justify-center rounded-2xl bg-[var(--turmeric)] px-6 text-base sm:text-lg font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all"
            >
              {t("demoLogin")}
            </Link>
            {sample && (
              <Link
                href={`/shop/${sample.slug}`}
                className="flex min-h-[44px] items-center justify-center text-sm sm:text-base font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
                style={{ color: "var(--trust)" }}
              >
                {t("sampleShop")}: {sample.name}
              </Link>
            )}
          </div>
        </section>
      </Reveal>

      {/* 11. FAQ Section */}
      <Reveal>
        <section id="faq" aria-label="FAQ" className="scroll-mt-20">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Got Questions?
            </span>
            <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="card-simple p-4 sm:p-5 rounded-2xl group cursor-pointer transition-colors hover:border-[var(--turmeric)]"
              >
                <summary className="min-h-[38px] flex items-center justify-between text-base font-bold list-none outline-hidden">
                  <span>{f.q}</span>
                  <span className="text-xs transition-transform group-open:rotate-180 opacity-60">
                    ▼
                  </span>
                </summary>
                <p
                  className="mt-3 text-sm sm:text-base opacity-80 leading-relaxed pl-1 pt-3 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 12. Final Bottom CTA & Modern Footer */}
      <section className="flex flex-col items-center gap-6 text-center pt-6 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col items-center gap-2 max-w-lg">
          <h2 className="display text-2xl sm:text-4xl font-bold tracking-tight">
            शुरू करें आज ही (Start Selling Today)
          </h2>
          <p className="text-sm opacity-75">
            Free forever for rural micro-entrepreneurs. No commission, no hidden charges.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <Link
            href={isAuthed ? dashboardHref : "/auth/register"}
            className="flex min-h-[56px] sm:min-h-[60px] flex-1 w-full items-center justify-center rounded-2xl bg-[var(--turmeric)] px-6 text-base sm:text-lg font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all"
          >
            {isAuthed ? `🏪 Open Dashboard (${userName})` : t("start")}
          </Link>
          <DownloadAppButton label="📲 Get App" sublabel="Works Offline" className="w-full sm:w-auto" />
        </div>

        <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs opacity-70 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <span className="font-bold">ओजस्विनी (Ojasvini)</span>
            <span>·</span>
            <span>Made with ❤️ for Indian Rural Women</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/app/learn" className="hover:underline">
              {t("featuresTitle")}
            </Link>
            <Link href="/auth/staff" className="hover:underline">
              Sakhi / Admin Login
            </Link>
            <Link href="/gallery" className="hover:underline">
              Product Gallery
            </Link>
            <Link href="/offline" className="hover:underline">
              Offline Mode
            </Link>
          </div>
        </footer>
        <p className="text-[11px] opacity-45 -mt-3">{c("demoHint")}</p>
      </section>
    </main>
  );
}
