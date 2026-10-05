"use client";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePrefs } from "@/lib/store/prefs";

export type SchemeListItem = {
  id: string;
  name: string;
  level: string;
  categories: string[];
  benefit: string;
  documents: string[];
  applyUrl: string | null;
  lastVerifiedAt: string | null;
  sourceUrl: string | null;
  verdict: "ELIGIBLE" | "MAYBE" | "NOT_ELIGIBLE";
  reasons: Array<{ code: string; want?: string }>;
};

/** Scheme card: verdict ribbon, plain benefit, explain/save/share. No dead ends. */
export function SchemeCard({ item, saved, onSave }: { item: SchemeListItem; saved: boolean; onSave: (id: string, save: boolean) => void }) {
  const t = useTranslations("schemes");
  const tr = useTranslations("schemes.reasons");
  const { locale } = usePrefs();
  const [points, setPoints] = useState<string[] | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  async function explain() {
    if (points) return;
    setExplaining(true);
    try {
      const r = await fetch("/api/schemes/explain", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ schemeId: item.id, locale }),
      }).then((x) => x.json());
      if (r.ok) setPoints(r.points);
    } catch {}
    finally {
      setExplaining(false);
    }
  }

  async function readAloud() {
    if (!points || speaking) return;
    const { getTTS } = await import("@/lib/voice/adapters");
    const tts = getTTS();
    if (!tts.supported) return;
    setSpeaking(true);
    try {
      await tts.speak(points.join(" "), locale, 1);
    } finally {
      setSpeaking(false);
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`${item.name}: ${item.benefit} ${item.applyUrl || ""}`)}`;

  return (
    <article className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: item.verdict === "ELIGIBLE" ? "var(--leaf)" : "var(--border)" }} aria-label={item.name}>
      <p
        className="mb-1 inline-block rounded-full px-3 py-0.5 text-sm font-bold text-white"
        style={{ background: item.verdict === "ELIGIBLE" ? "var(--leaf)" : item.verdict === "MAYBE" ? "var(--turmeric)" : "var(--mist)", color: item.verdict === "MAYBE" ? "var(--primary-ink)" : "#fff" }}
      >
        {item.verdict === "ELIGIBLE" ? t("eligible") : item.verdict === "MAYBE" ? t("maybe") : t("notEligible")}
      </p>
      <h3 className="display text-xl font-bold">
        <Link href={`/app/schemes/${item.id}`} className="underline-offset-2 hover:underline">
          {item.name}
        </Link>
      </h3>
      <p className="mt-1 text-base opacity-80">{item.benefit}</p>
      {item.reasons.length > 0 && (
        <p className="mt-1 text-sm opacity-70">
          {item.reasons.map((r) => tr(r.code as "state", r.want ? { want: r.want } : undefined)).join(" · ")}
        </p>
      )}
      {points && (
        <ul className="mt-2 flex flex-col gap-1 rounded-[12px] bg-[var(--clay-soft)] p-3">
          {points.map((p, i) => (
            <li key={i} className="text-base">• {p}</li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {!points ? (
          <button type="button" onClick={explain} disabled={explaining} className="min-h-[48px] rounded-full bg-[var(--indigo)] px-4 text-sm font-bold text-white disabled:opacity-60">
            {t("explain")}
          </button>
        ) : (
          <button type="button" onClick={readAloud} disabled={speaking} className="min-h-[48px] rounded-full border-2 px-4 text-sm font-bold disabled:opacity-60" style={{ borderColor: "var(--border)" }}>
            {speaking ? "♪" : "🔊"} {t("readAloud")}
          </button>
        )}
        <button
          type="button"
          onClick={() => onSave(item.id, !saved)}
          aria-pressed={saved}
          className="min-h-[48px] rounded-full border-2 px-4 text-sm font-bold"
          style={{ borderColor: saved ? "var(--turmeric)" : "var(--border)", background: saved ? "var(--clay-soft)" : "transparent" }}
        >
          {saved ? `★ ${t("saved")}` : t("save")}
        </button>
        <a href={wa} target="_blank" rel="noreferrer" className="flex min-h-[48px] items-center rounded-full border-2 px-4 text-sm font-bold" style={{ borderColor: "var(--border)" }}>
          {t("share")}
        </a>
      </div>
    </article>
  );
}
