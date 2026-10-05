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
    <main className="weave-bg mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-10 sm:gap-14 px-3.5 sm:px-6 pb-16 pt-3 sm:pt-6" id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header with smart auth state */}
      <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-b pb-3" style={{ borderColor: "var(--border)" }}>
        <div className="w-full sm:w-auto overflow-hidden">
          <LanguageChip />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
          {isAuthed ? (
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-semibold opacity-80 truncate max-w-[140px] sm:max-w-none">🙏 नमस्ते, {userName}</span>
              <Link
                href={dashboardHref}
                className="flex min-h-[38px] sm:min-h-[42px] items-center gap-1.5 rounded-full bg-[var(--turmeric)] px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-[var(--primary-ink)] shadow-xs transition-transform active:scale-95 hover:brightness-105 shrink-0"
              >
                🏪 दुकान डॅशबोर्ड →
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2.5 text-xs sm:text-sm font-bold w-full sm:w-auto">
              <Link href="/auth/login" className="px-3.5 py-1.5 rounded-full border bg-[var(--card)] hover:border-[var(--turmeric)] shadow-xs" style={{ borderColor: "var(--border)" }}>
                लॉगिन (Login)
              </Link>
              <Link href="/auth/staff" className="px-3 py-1.5 rounded-full text-[var(--indigo)] underline hover:opacity-80">
                Staff / Admin
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 1. Enhanced Hero */}
      <section className="relative flex flex-col items-center gap-4 sm:gap-5 text-center pt-1 sm:pt-2" aria-label={t("title")}>
        {/* Glow halo */}
        <div className="relative">
          <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-tr from-amber-400/25 via-rose-500/15 to-orange-400/25 blur-2xl pointer-events-none" />
          <VoiceOrb state="idle" size={120} label="Ojas listening orb" />
        </div>

        {/* Feature badges strip */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 px-1">
          <span className="rounded-full bg-[var(--clay-soft)] px-2.5 sm:px-3 py-1 border whitespace-nowrap" style={{ borderColor: "var(--border)" }}>🎙️ 100% Voice First</span>
          <span className="rounded-full bg-[var(--clay-soft)] px-2.5 sm:px-3 py-1 border whitespace-nowrap" style={{ borderColor: "var(--border)" }}>📸 Photo AI Listing</span>
          <span className="rounded-full bg-[var(--clay-soft)] px-2.5 sm:px-3 py-1 border whitespace-nowrap" style={{ borderColor: "var(--border)" }}>🇮🇳 8 Languages</span>
          <span className="rounded-full bg-[var(--clay-soft)] px-2.5 sm:px-3 py-1 border whitespace-nowrap" style={{ borderColor: "var(--border)" }}>📴 Works Offline</span>
        </div>

        <h1 className="display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
          {t("title")}
        </h1>
        <p className="text-lg sm:text-2xl font-bold" style={{ color: "var(--madder)" }}>
          {c("tagline")}
        </p>
        <p className="max-w-[54ch] text-sm sm:text-lg opacity-80 leading-relaxed px-2">
          {t("subtitle")}
        </p>
        <ListenButton text={`${t("title")}. ${t("subtitle")}`} />

        {/* Dynamic CTAs */}
        <div className="flex w-full max-w-md flex-col gap-2.5 mt-2 px-1">
          {isAuthed ? (
            <Link
              href={dashboardHref}
              className="flex min-h-[54px] sm:min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--turmeric)] px-6 text-base sm:text-xl font-bold text-[var(--primary-ink)] shadow-md hover:brightness-105 active:scale-98 transition-all"
            >
              🏪 Continue to Your Shop ({userName}) →
            </Link>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/auth/register"
                className="flex min-h-[50px] sm:min-h-[60px] items-center justify-center rounded-[18px] bg-[var(--turmeric)] px-4 text-base md:text-lg font-bold text-[var(--primary-ink)] shadow-md hover:brightness-105 active:scale-98 transition-all text-center"
              >
                {t("start")}
              </Link>
              <Link
                href="/auth/login"
                className="flex min-h-[50px] sm:min-h-[60px] items-center justify-center rounded-[18px] border-2 bg-[var(--card)] px-4 text-base md:text-lg font-bold text-[var(--foreground)] shadow-xs hover:border-[var(--turmeric)] active:scale-98 transition-all text-center"
                style={{ borderColor: "var(--border)" }}
              >
                लॉगिन (Login)
              </Link>
            </div>
          )}

          <Link
            href="#how"
            className="flex min-h-[44px] items-center justify-center text-sm md:text-base font-bold underline transition-opacity active:opacity-60"
            style={{ color: "var(--indigo)" }}
          >
            {t("howCta")} ↓
          </Link>
        </div>

        <PhoneMockup speak={t("speak")} snap={t("snap")} sell={t("sell")} />
        <p className="text-xs sm:text-sm opacity-70 mt-1 px-2">{t("trust")}</p>
      </section>

      {/* 2. Problem */}
      <Reveal>
        <section aria-label={t("problemTitle")}>
          <h2 className="display text-3xl font-bold">{t("problemTitle")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <article key={s.v} className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
                <p className="display text-3xl font-bold" style={{ color: "var(--madder)" }}>{s.v}</p>
                <p className="mt-1 text-base opacity-80">{s.d}</p>
              </article>
            ))}
          </div>
          <p className="mt-2 text-xs opacity-60">{t("illustrative")}</p>
        </section>
      </Reveal>

      {/* 3. How it works */}
      <Reveal>
        <section id="how" aria-label={t("howTitle")} className="scroll-mt-6">
          <h2 className="display text-3xl font-bold">{t("howTitle")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {steps.map((s) => (
              <article key={s.title} className="rounded-[20px] border bg-[var(--card)] p-5 text-center" style={{ borderColor: "var(--border)" }}>
                <p aria-hidden className="text-4xl">{s.icon}</p>
                <h3 className="display mt-2 text-2xl font-bold">{s.title}</h3>
                <p className="mt-1 text-base opacity-75">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 4. Journey */}
      <Reveal>
        <section aria-label={t("journeyTitle")}>
          <h2 className="display text-3xl font-bold">{t("journeyTitle")}</h2>
          <ol className="mt-3 flex flex-col gap-2">
            {journey.map((j, i) => (
              <li key={j.t} className="flex items-center gap-3 rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
                <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold text-[var(--primary-ink)]" style={{ background: "var(--turmeric)" }}>{i + 1}</span>
                <div>
                  <p className="text-lg font-bold">{j.t}</p>
                  <p className="text-sm opacity-70">{j.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* 5. Features */}
      <Reveal>
        <section aria-label={t("featuresTitle")}>
          <h2 className="display text-3xl font-bold">{t("featuresTitle")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <article key={f.t} className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-lg font-bold">{f.t}</h3>
                <p className="mt-1 text-base opacity-75">{f.d}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* 6. Why different */}
      <Reveal>
        <section aria-label={t("whyTitle")}>
          <h2 className="display text-3xl font-bold">{t("whyTitle")}</h2>
          <div className="mt-3 overflow-x-auto rounded-[20px] border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="bg-[var(--clay-soft)]">
                  <th className="p-3" scope="col">{t("whyCols.0")}</th>
                  <th className="p-3" scope="col">{t("whyCols.1")}</th>
                  <th className="p-3" scope="col">{t("whyCols.2")}</th>
                </tr>
              </thead>
              <tbody>
                {whyRows.map((r, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3 font-bold">{r[0]}</td>
                    <td className="p-3 opacity-75">{r[1]}</td>
                    <td className="p-3 opacity-75">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* 7. Ryani story */}
      <Reveal>
        <section aria-label={t("storyTitle")} className="rounded-[20px] bg-[var(--clay-soft)] p-6">
          <div className="flex items-center gap-3">
            <OjasDidi mood="celebrating" size={72} />
            <h2 className="display text-3xl font-bold">{t("storyTitle")}</h2>
          </div>
          <ol className="mt-3 flex flex-col gap-2">
            {story.map((s) => (
              <li key={s.d} className="flex gap-3 text-base">
                <span aria-hidden className="font-bold" style={{ color: "var(--madder)" }}>{s.d}</span>
                <span>{s.t}</span>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* 8. Impact */}
      <Reveal>
        <section aria-label={t("impactTitle")} className="rounded-[20px] border bg-[var(--card)] p-6 text-center" style={{ borderColor: "var(--border)" }}>
          <h2 className="display text-3xl font-bold">{t("impactTitle")}</h2>
          <p className="mt-2 text-base font-bold">SDG 4 · SDG 9</p>
          <p className="mt-1 text-base opacity-80">{t("impactLine")}</p>
        </section>
      </Reveal>

      {/* 9. Demo */}
      <Reveal>
        <section aria-label={t("demoTitle")} className="rounded-[20px] border-2 bg-[var(--card)] p-6 text-center" style={{ borderColor: "var(--turmeric)" }}>
          <h2 className="display text-3xl font-bold">{t("demoTitle")}</h2>
          <p className="mt-1 text-base opacity-75">{t("demoOtpNote")}</p>
          <div className="mx-auto mt-3 flex max-w-md flex-col gap-2">
            <Link href="/auth/login" className="flex min-h-[64px] items-center justify-center rounded-[20px] bg-[var(--turmeric)] px-6 text-lg font-bold text-[var(--primary-ink)]">
              {t("demoLogin")}
            </Link>
            {sample && (
              <Link href={`/shop/${sample.slug}`} className="flex min-h-[56px] items-center justify-center text-base font-bold underline" style={{ color: "var(--indigo)" }}>
                {t("sampleShop")}: {sample.name}
              </Link>
            )}
          </div>
        </section>
      </Reveal>

      {/* 10. FAQ */}
      <Reveal>
        <section aria-label="FAQ">
          <h2 className="display text-3xl font-bold">FAQ</h2>
          <div className="mt-3 flex flex-col gap-2">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
                <summary className="min-h-[48px] cursor-pointer text-base font-bold">{f.q}</summary>
                <p className="mt-1 text-base opacity-80">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Final CTA + footer */}
      <section className="flex flex-col items-center gap-3 text-center">
        <Link
          href={isAuthed ? dashboardHref : "/auth/register"}
          className="flex min-h-[64px] w-full max-w-md items-center justify-center rounded-[20px] bg-[var(--turmeric)] px-6 text-lg font-bold text-[var(--primary-ink)] shadow-md hover:brightness-105 active:scale-98 transition-all"
        >
          {isAuthed ? `🏪 Open Dashboard (${userName})` : t("start")}
        </Link>
        <footer className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm opacity-70">
          <Link href="/app/learn" className="underline">{t("featuresTitle")}</Link>
          <Link href="/auth/staff" className="underline">Sakhi / Admin</Link>
          <span>{t("footer")}</span>
        </footer>
        <p className="text-xs opacity-60">{c("demoHint")}</p>
      </section>
    </main>
  );
}
