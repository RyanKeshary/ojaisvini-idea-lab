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
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <h1 className="display text-4xl font-bold">Aaj</h1>
      <div className="flex items-center gap-4 rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
        <VoiceOrb state="idle" size={96} />
        <div>
          <StepDots total={3} current={0} />
          <p className="mt-2 text-lg font-bold">First sale in 3 steps</p>
          <p className="text-base opacity-70">1. {t("create")}</p>
        </div>
      </div>
      <EarningsCounter value={2450} label="Is hafte ki kamai" />
      {insights && (
        <section className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--indigo)" }} aria-label={th("insights")}>
          <h2 className="display text-xl font-bold">💡 {th("insights")}</h2>
          <p className="mt-1 text-base">{insights.summary}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {[insights.s1, insights.s2, insights.s3].map((s, i) => (
              <li key={i} className="text-base">• {s}</li>
            ))}
          </ul>
          <div className="mt-2">
            <ListenButton text={`${insights.summary} ${insights.s1} ${insights.s2} ${insights.s3}`} compact />
          </div>
        </section>
      )}
      <div className="flex items-center gap-4">
        <ProgressRing value={0.4} label="Journey progress" />
        <ListenButton text="Is hafte aapne 2450 rupaye kamaye. Pehla kadam: naya samaan jodein." />
      </div>
    </main>
  );
}
