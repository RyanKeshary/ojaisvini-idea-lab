"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListenButton } from "@/components/voice/ListenButton";
import { JOURNEYS } from "@/lib/learn/catalog";

type LessonState = { key: string; order: number; status: string };
type JourneyState = { id: string; icon: string; lessons: LessonState[] };

const ORDER = ["upi", "whatsapp", "photo", "pricing", "phone", "packing", "safety", "schemes"];

/**Deterministic next-lesson recommender: first incomplete lesson in trade order. */
function recommend(journeys: JourneyState[]): { journey: string; key: string } | null {
  for (const jid of ORDER) {
    const j = journeys.find((x) => x.id === jid);
    const next = j?.lessons.find((l) => l.status !== "DONE");
    if (next) return { journey: jid, key: next.key };
  }
  return null;
}

export default function LearnHubPage() {
  const t = useTranslations("learn");
  const [journeys, setJourneys] = useState<JourneyState[]>([]);
  const [badges, setBadges] = useState<Array<{ code: string; icon: string }>>([]);

  useEffect(() => {
    fetch("/api/learn/progress")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setJourneys(j.journeys);
          setBadges(j.badges);
        }
      })
      .catch(() => {});
  }, []);

  const next = recommend(journeys);
  const totalLessons = JOURNEYS.reduce((a, j) => a + j.lessons.length, 0);
  const doneCount = journeys.flatMap((j) => j.lessons).filter((l) => l.status === "DONE").length;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-4xl font-bold">{t("title")}</h1>
      <p className="text-base opacity-75">{t("subtitle")}</p>
      <div className="flex items-center gap-4 rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
        <ProgressRing value={totalLessons ? doneCount / totalLessons : 0} label={`${doneCount}/${totalLessons}`} />
        <ListenButton text={`${t("title")}. ${doneCount} of ${totalLessons} done.`} />
      </div>

      {next && (
        <Link
          href={`/app/learn/${next.journey}/${next.key}`}
          className="rounded-[20px] bg-[var(--turmeric)] p-5 text-[var(--primary-ink)]"
          aria-label={`${t("nextUp")}`}
        >
          <p className="text-sm font-bold opacity-70">{t("nextUp")}</p>
          <p className="display text-2xl font-bold">{t("continue")} →</p>
        </Link>
      )}

      <section aria-label={t("badges")} className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-lg font-bold">{t("badges")}</h2>
        {badges.length === 0 ? (
          <p className="mt-1 text-sm opacity-70">{t("noBadges")}</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {badges.map((b) => (
              <li key={b.code} className="grid h-14 w-14 place-items-center rounded-full bg-[var(--clay-soft)] text-2xl" title={b.code} aria-label={`Badge ${b.code}`}>
                <span aria-hidden>{b.icon}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {journeys.length === 0 ? (
        <EmptyState icon="📚" title={t("title")} />
      ) : (
        journeys.map((j) => {
          const done = j.lessons.filter((l) => l.status === "DONE").length;
          return (
            <section key={j.id} className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }} aria-label={t(`journeys.${j.id}`)}>
              <div className="flex items-center justify-between">
                <h2 className="display text-xl font-bold">
                  <span aria-hidden>{j.icon} </span>
                  {t(`journeys.${j.id}`)}
                </h2>
                <span className="text-sm font-bold opacity-70">{done}/{j.lessons.length}</span>
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {j.lessons.map((l) => (
                  <li key={l.key}>
                    <Link
                      href={`/app/learn/${j.id}/${l.key}`}
                      className="flex min-h-[56px] items-center justify-between rounded-[12px] border px-3"
                      style={{ borderColor: "var(--border)" }}
                      aria-label={`${l.key} ${l.status === "DONE" ? t("done") : t("start")}`}
                    >
                      <span className="text-base font-bold">{t("lessons")} {l.order}</span>
                      <span aria-hidden className="text-xl">{l.status === "DONE" ? "✅" : "▶️"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </main>
  );
}
