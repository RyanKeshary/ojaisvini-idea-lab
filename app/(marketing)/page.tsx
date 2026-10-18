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

/** Landing: minimal, informative, calm motion. hi/mr/en throughout. */
export default async function LandingPage() {
  const session = await auth();
  const isAuthed = !!session?.user?.id;
  const userName = session?.user?.name || "दीदी";
  const userRole = (session?.user as { role?: string })?.role;
  const dashboardHref = userRole === "ADMIN" ? "/admin" : userRole === "SAKHI" ? "/sakhi-console" : "/app/home";

  const t = await getTranslations("landing");
  const c = await getTranslations("common");
  const sample = await db.shop.findFirst({
    where: { isLive: true, products: { some: { status: "LIVE" } } },
    select: { slug: true, name: true },
  });

  const steps = [0, 1, 2].map((i) => ({
    icon: ["🎙️", "📷", "🏪"][i],
    title: t(`steps.${i}.t`),
    desc: t(`steps.${i}.d`),
  }));
  const journey = [0, 1, 2, 3, 4].map((i) => ({ t: t(`journey.${i}.t`), d: t(`journey.${i}.d`) }));
  const features = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ t: t(`features.${i}.t`), d: t(`features.${i}.d`) }));
  const story = [0, 1, 2, 3, 4].map((i) => ({ d: t(`story.${i}.d`), t: t(`story.${i}.t`) }));
  const stats = [0, 1, 2].map((i) => ({ v: t(`stats.${i}.v`), d: t(`stats.${i}.d`) }));
  const faqs = [0, 1, 2, 3].map((i) => ({ q: t(`faq.${i}.q`), a: t(`faq.${i}.a`) }));
  const whyRows = [0, 1, 2, 3].map((i) => [t(`why.rows.${i}.0`), t(`why.rows.${i}.1`), t(`why.rows.${i}.2`)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Ojasvini",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0" },
    inLanguage: ["hi", "mr", "en", "gu", "ta"],
  };

  return (
    <main className="weave-bg mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-12 sm:gap-16 px-4 sm:px-6 pb-20 pt-4 sm:pt-6" id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Floating minimalist glass header */}
      <header className="sticky top-3 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white/75 dark:bg-stone-900/75 backdrop-blur-md px-3.5 py-2.5 border shadow-xs" style={{ borderColor: "var(--border)" }}>
        <div className="w-full sm:w-auto overflow-hidden">
          <LanguageChip />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
          {isAuthed ? (
            <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-semibold opacity-85 truncate max-w-[140px] sm:max-w-none">🙏 नमस्ते, {userName}</span>
              <Link
                href={dashboardHref}
                className="flex min-h-[38px] sm:min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--turmeric)] px-4 text-xs sm:text-sm font-bold text-[var(--primary-ink)] shadow-xs transition-all active:scale-95 hover:opacity-90 shrink-0"
              >
                🏪 दुकान डॅशबोर्ड →
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 text-xs sm:text-sm font-bold w-full sm:w-auto">
              <Link href="/auth/login" className="px-4 py-1.5 rounded-full border bg-[var(--card)] hover:border-[var(--turmeric)] shadow-xs transition-colors" style={{ borderColor: "var(--border)" }}>
                लॉगिन (Login)
              </Link>
              <Link href="/auth/staff" className="px-3 py-1.5 rounded-full text-[var(--trust)] hover:underline opacity-80 hover:opacity-100 transition-opacity">
                Staff / Admin
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 1. Calm, Elegant Hero */}
      <section className="relative flex flex-col items-center gap-5 text-center pt-2 sm:pt-4" aria-label={t("title")}>
        {/* Ambient halo glow */}
        <div className="relative">
          <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-teal-400/25 via-emerald-400/20 to-teal-200/20 blur-3xl pointer-events-none" />
          <VoiceOrb state="idle" size={124} label="Ojas listening orb" />
        </div>

        {/* Minimal feature badges pill row */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-stone-700 dark:text-stone-300 px-1">
          <span className="rounded-full bg-white/70 dark:bg-stone-900/60 backdrop-blur-xs px-3 py-1 border shadow-xs" style={{ borderColor: "var(--border)" }}>🎙️ Voice First</span>
          <span className="rounded-full bg-white/70 dark:bg-stone-900/60 backdrop-blur-xs px-3 py-1 border shadow-xs" style={{ borderColor: "var(--border)" }}>📸 Photo AI Listing</span>
          <span className="rounded-full bg-white/70 dark:bg-stone-900/60 backdrop-blur-xs px-3 py-1 border shadow-xs" style={{ borderColor: "var(--border)" }}>🇮🇳 8 Languages</span>
          <span className="rounded-full bg-white/70 dark:bg-stone-900/60 backdrop-blur-xs px-3 py-1 border shadow-xs" style={{ borderColor: "var(--border)" }}>📴 Works Offline</span>
        </div>

        <h1 className="display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--fg)] leading-tight max-w-2xl">
          {t("title")}
        </h1>
        <p className="text-lg sm:text-2xl font-bold tracking-tight" style={{ color: "var(--accent)" }}>
          {c("tagline")}
        </p>
        <p className="max-w-[50ch] text-sm sm:text-lg opacity-80 leading-relaxed px-2 font-normal">
          {t("subtitle")}
        </p>
        <ListenButton text={`${t("title")}. ${t("subtitle")}`} />

        {/* Clean, functional CTAs */}
        <div className="flex w-full max-w-md flex-col gap-3 mt-1 px-1">
          {isAuthed ? (
            <Link
              href={dashboardHref}
              className="flex min-h-[56px] sm:min-h-[62px] items-center justify-center rounded-2xl bg-[var(--turmeric)] px-6 text-base sm:text-lg font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all"
            >
              🏪 Continue to Your Shop ({userName}) →
            </Link>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/auth/register"
                className="flex min-h-[52px] sm:min-h-[58px] items-center justify-center rounded-2xl bg-[var(--turmeric)] px-4 text-base md:text-lg font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all text-center"
              >
                {t("start")}
              </Link>
              <Link
                href="/auth/login"
                className="flex min-h-[52px] sm:min-h-[58px] items-center justify-center rounded-2xl border bg-[var(--card)] px-4 text-base md:text-lg font-bold text-[var(--fg)] shadow-xs hover:border-[var(--turmeric)] active:scale-98 transition-all text-center"
                style={{ borderColor: "var(--border)" }}
              >
                लॉगिन (Login)
              </Link>
            </div>
          )}

          <Link
            href="#how"
            className="flex min-h-[42px] items-center justify-center text-sm md:text-base font-semibold underline underline-offset-4 transition-opacity hover:opacity-80 active:opacity-60"
            style={{ color: "var(--trust)" }}
          >
            {t("howCta")} ↓
          </Link>
        </div>

        <PhoneMockup speak={t("speak")} snap={t("snap")} sell={t("sell")} />
        <p className="text-xs sm:text-sm opacity-65 mt-1 px-2">{t("trust")}</p>
      </section>

      {/* 2. Key Problem Stats */}
      <Reveal>
        <section aria-label={t("problemTitle")}>
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">{t("problemTitle")}</h2>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
            {stats.map((s) => (
              <article key={s.v} className="card-simple p-5">
                <p className="display text-3xl sm:text-4xl font-bold" style={{ color: "var(--accent)" }}>{s.v}</p>
                <p className="mt-1.5 text-sm sm:text-base opacity-75 font-medium leading-snug">{s.d}</p>
              </article>
            ))}
          </div>
          <p className="mt-2 text-xs opacity-50 px-1">{t("illustrative")}</p>
        </section>
      </Reveal>

      {/* 3. How It Works */}
      <Reveal>
        <section id="how" aria-label={t("howTitle")} className="scroll-mt-8">
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">{t("howTitle")}</h2>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
            {steps.map((s) => (
              <article key={s.title} className="card-simple p-6 text-center flex flex-col items-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--clay-soft)]/60 text-2xl mb-3 shadow-inner">
                  {s.icon}
                </span>
                <h3 className="display text-xl font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm opacity-75 leading-relaxed">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 4. Journey Steps */}
      <Reveal>
        <section aria-label={t("journeyTitle")}>
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">{t("journeyTitle")}</h2>
          <ol className="mt-4 flex flex-col gap-2.5">
            {journey.map((j, i) => (
              <li key={j.t} className="card-simple flex items-center gap-4 p-4">
                <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold text-sm text-[var(--primary-ink)] bg-[var(--turmeric)] shadow-xs">
                  0{i + 1}
                </span>
                <div>
                  <p className="text-base sm:text-lg font-bold">{j.t}</p>
                  <p className="text-sm opacity-70 leading-snug mt-0.5">{j.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* 5. Features Grid */}
      <Reveal>
        <section aria-label={t("featuresTitle")}>
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">{t("featuresTitle")}</h2>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            {features.map((f) => (
              <article key={f.t} className="card-simple p-5">
                <h3 className="text-base sm:text-lg font-bold">{f.t}</h3>
                <p className="mt-1.5 text-sm opacity-75 leading-relaxed">{f.d}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 6. Why Different Comparison Table */}
      <Reveal>
        <section aria-label={t("whyTitle")}>
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">{t("whyTitle")}</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border bg-[var(--card)] shadow-xs" style={{ borderColor: "var(--border)" }}>
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead>
                <tr className="bg-[var(--clay-soft)]/60">
                  <th className="p-3.5 font-bold" scope="col">{t("whyCols.0")}</th>
                  <th className="p-3.5 font-bold" scope="col">{t("whyCols.1")}</th>
                  <th className="p-3.5 font-bold" scope="col">{t("whyCols.2")}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {whyRows.map((r, i) => (
                  <tr key={i} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
                    <td className="p-3.5 font-bold text-[var(--fg)]">{r[0]}</td>
                    <td className="p-3.5 opacity-75">{r[1]}</td>
                    <td className="p-3.5 opacity-75">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* 7. Ryani Story */}
      <Reveal>
        <section aria-label={t("storyTitle")} className="card-simple bg-gradient-to-br from-white/95 to-[var(--clay-soft)]/40 dark:from-stone-900/90 dark:to-stone-900/40 p-6 sm:p-7">
          <div className="flex items-center gap-3.5">
            <OjasDidi mood="celebrating" size={68} />
            <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">{t("storyTitle")}</h2>
          </div>
          <ol className="mt-4 flex flex-col gap-2.5">
            {story.map((s) => (
              <li key={s.d} className="flex gap-3 text-sm sm:text-base leading-relaxed">
                <span aria-hidden className="font-bold shrink-0" style={{ color: "var(--accent)" }}>{s.d}</span>
                <span className="opacity-85">{s.t}</span>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* 8. Impact */}
      <Reveal>
        <section aria-label={t("impactTitle")} className="card-simple p-6 sm:p-8 text-center">
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">{t("impactTitle")}</h2>
          <span className="inline-block mt-2 rounded-full bg-[var(--clay-soft)]/70 px-3.5 py-1 text-xs font-bold text-[var(--turmeric)]">SDG 4 · SDG 9</span>
          <p className="mt-2 text-sm sm:text-base opacity-80 max-w-lg mx-auto leading-relaxed">{t("impactLine")}</p>
        </section>
      </Reveal>

      {/* 9. Interactive Demo Section */}
      <Reveal>
        <section aria-label={t("demoTitle")} className="card-simple border-2 p-6 sm:p-8 text-center relative overflow-hidden" style={{ borderColor: "var(--turmeric)" }}>
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">{t("demoTitle")}</h2>
          <p className="mt-1.5 text-sm sm:text-base opacity-75 max-w-md mx-auto">{t("demoOtpNote")}</p>
          <div className="mx-auto mt-4 flex max-w-sm flex-col gap-2.5">
            <Link href="/auth/login" className="flex min-h-[56px] items-center justify-center rounded-2xl bg-[var(--turmeric)] px-6 text-base sm:text-lg font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all">
              {t("demoLogin")}
            </Link>
            {sample && (
              <Link href={`/shop/${sample.slug}`} className="flex min-h-[46px] items-center justify-center text-sm sm:text-base font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity" style={{ color: "var(--trust)" }}>
                {t("sampleShop")}: {sample.name}
              </Link>
            )}
          </div>
        </section>
      </Reveal>

      {/* 10. FAQ Accordions */}
      <Reveal>
        <section aria-label="FAQ">
          <h2 className="display text-2xl sm:text-3xl font-bold tracking-tight">FAQ</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {faqs.map((f) => (
              <details key={f.q} className="card-simple p-4 group cursor-pointer">
                <summary className="min-h-[44px] flex items-center justify-between text-base font-bold list-none outline-hidden">
                  <span>{f.q}</span>
                  <span className="text-xs transition-transform group-open:rotate-180 opacity-60">▼</span>
                </summary>
                <p className="mt-2 text-sm sm:text-base opacity-75 leading-relaxed pl-1 pt-2 border-t" style={{ borderColor: "var(--border)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Final Action & Footer */}
      <section className="flex flex-col items-center gap-4 text-center pt-2">
        <Link
          href={isAuthed ? dashboardHref : "/auth/register"}
          className="flex min-h-[58px] sm:min-h-[64px] w-full max-w-md items-center justify-center rounded-2xl bg-[var(--turmeric)] px-6 text-base sm:text-xl font-bold text-[var(--primary-ink)] shadow-md hover:opacity-95 active:scale-98 transition-all"
        >
          {isAuthed ? `🏪 Open Dashboard (${userName})` : t("start")}
        </Link>
        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs sm:text-sm opacity-65">
          <Link href="/app/learn" className="hover:underline">{t("featuresTitle")}</Link>
          <Link href="/auth/staff" className="hover:underline">Sakhi / Admin</Link>
          <span>{t("footer")}</span>
        </footer>
        <p className="text-[11px] opacity-50">{c("demoHint")}</p>
      </section>
    </main>
  );
}
