"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { ListenButton } from "@/components/voice/ListenButton";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { EarningsCounter } from "@/components/ui/EarningsCounter";
import { StepDots } from "@/components/ui/StepDots";
import { usePrefs } from "@/lib/store/prefs";

/** Home: next best action, progress, earnings, AI insights. */
export default function HomePage() {
  const t = useTranslations("nav");
  const th = useTranslations("home");
  const { locale } = usePrefs();
  const [insights, setInsights] = useState<{ summary: string; s1: string; s2: string; s3: string } | null>(null);

  useEffect(() => {
    fetch(`/api/insights?locale=${locale}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setInsights({ summary: j.summary, s1: j.s1, s2: j.s2, s3: j.s3 });
      })
      .catch(() => {});
  }, [locale]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 pt-1">
      <div className="flex items-baseline justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
        <div>
          <h1 className="display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--fg)]">आज (Today)</h1>
          <p className="text-xs sm:text-sm opacity-70 mt-0.5">आपका दैनिक व्यापार डैशबोर्ड</p>
        </div>
        <ListenButton text="आज का व्यापार डैशबोर्ड. पहली बिक्री 3 आसान चरणों में." compact />
      </div>

      {/* Voice-First Action Card */}
      <div className="card-simple p-5 sm:p-6 flex items-center gap-4 sm:gap-5 relative overflow-hidden">
        <div className="relative shrink-0">
          <div className="absolute inset-0 -m-3 rounded-full bg-teal-400/15 blur-xl pointer-events-none" />
          <VoiceOrb state="idle" size={88} />
        </div>
        <div className="flex-1 min-w-0">
          <StepDots total={3} current={0} />
          <p className="mt-2 text-base sm:text-lg font-bold text-[var(--fg)]">First sale in 3 steps</p>
          <p className="text-xs sm:text-sm opacity-75 mt-0.5">1. {t("create")}</p>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="card-simple p-5 sm:p-6">
        <EarningsCounter value={2450} label="इस हफ्ते की कमाई (This week's earnings)" />
      </div>

      {/* AI Business Insights */}
      {insights && (
        <section
          className="card-simple p-5 sm:p-6 border-l-4"
          style={{ borderLeftColor: "var(--turmeric)" }}
          aria-label={th("insights")}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="display text-lg sm:text-xl font-bold text-[var(--fg)]">💡 {th("insights")}</h2>
            <ListenButton text={`${insights.summary} ${insights.s1} ${insights.s2} ${insights.s3}`} compact />
          </div>
          <p className="mt-2 text-sm sm:text-base opacity-85 leading-relaxed">{insights.summary}</p>
          <ul className="mt-3 flex flex-col gap-1.5 pl-1">
            {[insights.s1, insights.s2, insights.s3].map((s, i) => (
              <li key={i} className="text-xs sm:text-sm opacity-80 flex items-start gap-2">
                <span className="text-[var(--turmeric)] font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Progress & Quick Assist */}
      <div className="card-simple p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <ProgressRing value={0.4} label="Journey progress" />
          <div>
            <p className="text-sm font-bold text-[var(--fg)]">Journey Progress</p>
            <p className="text-xs opacity-70">40% completed</p>
          </div>
        </div>
        <ListenButton text="इस हफ्ते आपने 2450 रुपये कमाए. पहला कदम: नया सामान जोड़ें." />
      </div>
    </main>
  );
}
