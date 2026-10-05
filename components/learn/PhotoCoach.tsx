"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

/** Photo-coach checklist: tick each light rule as she tries it. */
export function PhotoCoach({ onDone }: { onDone?: () => void }) {
  const t = useTranslations("learn");
  const tips = t.raw("photoTips") as string[];
  const [done, setDone] = useState<boolean[]>(tips.map(() => false));

  function toggle(i: number) {
    const next = done.map((d, ix) => (ix === i ? !d : d));
    setDone(next);
    if (next.every(Boolean)) onDone?.();
  }

  return (
    <div className="rounded-[20px] border-2 border-dashed bg-[var(--card)] p-5" style={{ borderColor: "var(--turmeric)" }} aria-label={t("photoSim")}>
      <p className="text-base font-bold">{t("photoSim")}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {tips.map((tip, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={done[i]}
              className="flex min-h-[56px] w-full items-center gap-3 rounded-[12px] border-2 px-3 text-left text-base"
              style={{ borderColor: done[i] ? "var(--leaf)" : "var(--border)", background: done[i] ? "var(--clay-soft)" : "transparent" }}
            >
              <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: done[i] ? "var(--leaf)" : "var(--border)", background: done[i] ? "var(--leaf)" : "transparent", color: "#fff" }}>
                {done[i] ? <Check size={16} /> : null}
              </span>
              {tip}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
