"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { BigButton } from "@/components/ui/BigButton";
import { StepDots } from "@/components/ui/StepDots";
import { ListenButton } from "@/components/voice/ListenButton";
import { ConfettiBurst } from "@/components/ui/ConfettiBurst";
import { AuthError } from "@/components/auth/AuthError";
import { FakeUpi } from "@/components/learn/FakeUpi";
import { WaCatalog } from "@/components/learn/WaCatalog";
import { PhotoCoach } from "@/components/learn/PhotoCoach";
import { lessonContent } from "@/lib/learn/content";
import { usePrefs } from "@/lib/store/prefs";

/** One lesson: swipeable cards → hands-on task → picture quiz → badge. */
export default function LessonPage() {
  const params = useParams<{ journey: string; lesson: string }>();
  const t = useTranslations("learn");
  const te = useTranslations("auth.errors");
  const router = useRouter();
  const { locale } = usePrefs();
  const content = useMemo(() => lessonContent(params.lesson, locale), [params.lesson, locale]);

  const [card, setCard] = useState(0);
  const [taskDone, setTaskDone] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [quizOk, setQuizOk] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [celebrate, setCelebrate] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCard(0);
    setTaskDone(false);
    setPicked(null);
    setTries(0);
    setQuizOk(false);
    setCelebrate(null);
  }, [params.lesson]);

  if (!content) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-0 py-6">
        <AuthError message={te("somethingWrong")} />
      </main>
    );
  }

  const cards = content.cards;
  const allText = `${content.title}. ${cards.map((c) => c.text).join(" ")}`;

  function check() {
    if (picked === null || !content) return;
    if (picked === content.quiz.answer) {
      setQuizOk(true);
    } else {
      setTries((x) => x + 1);
    }
  }

  async function finish() {
    setFinishing(true);
    setError(null);
    try {
      const r = await fetch("/api/learn/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: params.lesson, score: tries === 0 ? 100 : 60 }),
      }).then((x) => x.json());
      if (!r.ok) throw new Error(r.code);
      setCelebrate(r.newBadges.map((b: { code: string; icon: string }) => `${b.icon} ${b.code}`));
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setFinishing(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-3xl font-bold">{content.title}</h1>
      <ListenButton text={allText} />
      <AuthError message={error} />

      {/* Cards: swipeable (scroll-snap) + arrows. */}
      <section aria-label={content.title}>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2" role="group" aria-roledescription="carousel">
          {cards.map((c, i) => (
            <article
              key={i}
              className="flex w-[82%] shrink-0 snap-center flex-col items-center gap-2 rounded-[20px] border-2 bg-[var(--card)] p-6 text-center"
              style={{ borderColor: i === card ? "var(--turmeric)" : "var(--border)" }}
              aria-label={`Card ${i + 1} of ${cards.length}`}
            >
              <span aria-hidden className="text-5xl">{c.icon}</span>
              <p className="text-lg">{c.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCard((c) => Math.max(0, c - 1))}
            disabled={card === 0}
            aria-label="Previous card"
            className="grid min-h-[56px] min-w-[56px] place-items-center rounded-full border-2 disabled:opacity-40"
            style={{ borderColor: "var(--border)" }}
          >
            <ChevronLeft aria-hidden />
          </button>
          <StepDots total={cards.length} current={card} />
          <button
            type="button"
            onClick={() => setCard((c) => Math.min(cards.length - 1, c + 1))}
            disabled={card === cards.length - 1}
            aria-label="Next card"
            className="grid min-h-[56px] min-w-[56px] place-items-center rounded-full border-2 disabled:opacity-40"
            style={{ borderColor: "var(--border)" }}
          >
            <ChevronRight aria-hidden />
          </button>
        </div>
      </section>

      {/* Hands-on task. */}
      <section aria-label={t("yourTurn")} className="flex flex-col gap-2">
        <h2 className="display text-2xl font-bold">{t("yourTurn")}</h2>
        <p className="text-base opacity-75">{content.task.instruction}</p>
        {content.task.kind === "upi" && <FakeUpi onDone={() => setTaskDone(true)} />}
        {content.task.kind === "whatsapp" && <WaCatalog onDone={() => setTaskDone(true)} />}
        {content.task.kind === "photo" && <PhotoCoach onDone={() => setTaskDone(true)} />}
        {content.task.kind === "none" && (
          <button
            type="button"
            onClick={() => setTaskDone(true)}
            aria-pressed={taskDone}
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-[12px] border-2 text-base font-bold"
            style={{ borderColor: taskDone ? "var(--leaf)" : "var(--border)" }}
          >
            {taskDone ? <Check aria-hidden /> : null} {t("taskDone")}
          </button>
        )}
      </section>

      {/* Picture quiz. */}
      <section aria-label="Quiz" className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
        <h2 className="text-lg font-bold">{content.quiz.q}</h2>
        <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={content.quiz.q}>
          {content.quiz.options.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(i)}
              aria-pressed={picked === i}
              className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-[12px] border-2 px-2"
              style={{ borderColor: picked === i ? "var(--turmeric)" : "var(--border)" }}
            >
              <span aria-hidden className="text-3xl">{o.icon}</span>
              <span className="text-xs font-bold">{o.label}</span>
            </button>
          ))}
        </div>
        {!quizOk && tries > 0 && <p role="alert" className="mt-2 text-base font-bold" style={{ color: "var(--madder)" }}>{t("wrong")}</p>}
        {quizOk ? (
          <p role="status" className="mt-2 inline-flex items-center gap-2 text-base font-bold" style={{ color: "var(--leaf)" }}>
            <Check aria-hidden /> {t("correct")}
          </p>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={picked === null}
            className="mt-3 min-h-[56px] w-full rounded-[12px] bg-[var(--indigo)] text-base font-bold text-white disabled:opacity-50"
          >
            {t("check")}
          </button>
        )}
      </section>

      {celebrate ? (
        <div className="relative flex flex-col items-center gap-3 rounded-[20px] border-2 p-6 text-center" style={{ borderColor: "var(--leaf)" }}>
          <ConfettiBurst fire />
          <AnimatePresence>
            <motion.h2 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="display text-3xl font-bold">
              {t("celebrate")}
            </motion.h2>
          </AnimatePresence>
          {celebrate.map((b) => (
            <p key={b} className="rounded-full bg-[var(--clay-soft)] px-4 py-2 text-lg font-bold">
              {t("newBadge")} {b}
            </p>
          ))}
          <BigButton variant="secondary" onClick={() => router.push("/app/learn")}>{t("continue")}</BigButton>
        </div>
      ) : (
        <BigButton onClick={finish} state={finishing ? "loading" : "idle"}>{t("finish")}</BigButton>
      )}
    </main>
  );
}
