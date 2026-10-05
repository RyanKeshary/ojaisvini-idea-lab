"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BigButton } from "@/components/ui/BigButton";
import { AuthError } from "@/components/auth/AuthError";
import { ListenButton } from "@/components/voice/ListenButton";

type Mentee = {
  id: string;
  name: string;
  phone: string;
  village: string;
  locale: string;
  products: number;
  orders: number;
  lessons: number;
  stuck: string[];
};

type Sess = { id: string; woman: string; type: string; notes: string; scheduledAt: string | null; createdAt: string };

const STUCK_ICON: Record<string, string> = { "no-products": "🧺", "no-orders": "📦", "few-lessons": "📚" };

/** Sakhi console: mentees + stuck points, assisted onboarding, check-ins, pooling. */
export default function SakhiConsolePage() {
  const t = useTranslations("sakhi");
  const te = useTranslations("auth.errors");
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [phone, setPhone] = useState("");
  const [selWoman, setSelWoman] = useState("");
  const [noteType, setNoteType] = useState("followup");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const m = await fetch("/api/sakhi/mentees").then((r) => r.json());
      if (m.ok) {
        setMentees(m.mentees);
        if (!selWoman && m.mentees.length) setSelWoman(m.mentees[0].id);
      }
      const s = await fetch("/api/sakhi/sessions").then((r) => r.json());
      if (s.ok) setSessions(s.sessions);
    } catch {
      setError(te("somethingWrong"));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function assign() {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(te("invalidPhone"));
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/sakhi/mentees", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      }).then((x) => x.json());
      if (!r.ok) throw new Error(r.code);
      setPhone("");
      await load();
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function logSession() {
    if (!selWoman) return;
    setBusy(true);
    try {
      const r = await fetch("/api/sakhi/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ womanId: selWoman, type: noteType, notes }),
      }).then((x) => x.json());
      if (!r.ok) throw new Error(r.code);
      setNotes("");
      await load();
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 px-4 pb-16 pt-6">
      <h1 className="display text-4xl font-bold">{t("title")}</h1>
      <ListenButton text={t("title")} />
      <AuthError message={error} />

      <section className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }} aria-label={t("assign")}>
        <h2 className="text-lg font-bold">{t("assign")}</h2>
        <div className="mt-2 flex gap-2">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            placeholder="98XXXXXXXX"
            aria-label={t("assign")}
            className="min-h-[56px] min-w-0 flex-1 rounded-[12px] border-2 bg-transparent px-3 text-lg"
            style={{ borderColor: "var(--border)" }}
          />
          <button type="button" onClick={assign} disabled={busy} className="min-h-[56px] shrink-0 rounded-[12px] bg-[var(--turmeric)] px-5 text-base font-bold text-[var(--primary-ink)] disabled:opacity-60">
            {t("assignBtn")}
          </button>
        </div>
      </section>

      <section aria-label={t("mentees")} className="flex flex-col gap-2">
        <h2 className="display text-2xl font-bold">{t("mentees")} ({mentees.length})</h2>
        {mentees.map((m) => (
          <article key={m.id} className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: m.stuck.length ? "var(--turmeric)" : "var(--border)" }}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">{m.name}</p>
              <span className="text-sm opacity-70">{m.phone}{m.village ? ` · ${m.village}` : ""}</span>
            </div>
            <p className="mt-1 text-sm opacity-75">🧺 {m.products} · 📦 {m.orders} · 📚 {m.lessons}</p>
            {m.stuck.length > 0 && (
              <p className="mt-1 text-sm font-bold" role="status">
                {m.stuck.map((s) => `${STUCK_ICON[s] || "•"} ${t(`stuck.${s}`)}`).join(" · ")}
              </p>
            )}
          </article>
        ))}
      </section>

      <section className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }} aria-label={t("checkin")}>
        <h2 className="text-lg font-bold">{t("checkin")}</h2>
        <div className="mt-2 flex gap-2">
          <select
            value={selWoman}
            onChange={(e) => setSelWoman(e.target.value)}
            aria-label={t("mentees")}
            className="min-h-[56px] min-w-0 flex-1 rounded-[12px] border-2 bg-transparent px-2 text-base"
            style={{ borderColor: "var(--border)" }}
          >
            {mentees.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
            aria-label={t("checkin")}
            className="min-h-[56px] rounded-[12px] border-2 bg-transparent px-2 text-base"
            style={{ borderColor: "var(--border)" }}
          >
            {["visit", "call", "training", "followup", "problem"].map((ty) => (
              <option key={ty} value={ty}>{t(`types.${ty}`)}</option>
            ))}
          </select>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 500))}
          rows={2}
          maxLength={500}
          placeholder={t("notesHint")}
          aria-label={t("notesHint")}
          className="mt-2 w-full rounded-[12px] border-2 bg-transparent px-3 py-2 text-base"
          style={{ borderColor: "var(--border)" }}
        />
        <div className="mt-2">
          <BigButton variant="secondary" onClick={logSession}>{t("logBtn")}</BigButton>
        </div>
        <ul className="mt-3 flex flex-col gap-1">
          {sessions.slice(0, 10).map((s) => (
            <li key={s.id} className="text-sm">
              <span className="font-bold">{s.woman}</span> · {s.type}{s.notes ? ` — ${s.notes}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
