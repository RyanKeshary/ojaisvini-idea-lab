"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mic, Send, Square } from "lucide-react";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { getSTT } from "@/lib/voice/adapters";
import { usePrefs } from "@/lib/store/prefs";

type Action = { name: string; value: string };
type Msg = { id: string; role: string; content: string; feedback?: number | null; action?: Action | null };

const CHIPS = ["price", "photo", "upi", "scheme"] as const;

function actionHref(a: Action): string {
  if (a.name === "open-lesson") {
    const key = a.value.includes("-") ? a.value : "upi-1";
    const journey = key.split("-")[0] || "upi";
    return `/app/learn/${journey}/${key}`;
  }
  if (a.name === "open-scheme") return "/app/schemes";
  if (a.name === "start-create") return "/app/create";
  return "/app/home";
}

/** Sakhi Didi: voice/text chat, streamed replies, grounded actions. */
export default function AssistantPage() {
  const t = useTranslations("assistant");
  const te = useTranslations("auth.errors");
  const { locale } = usePrefs();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/assistant")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setThreadId(j.threadId);
          setMsgs(j.messages);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || streaming) return;
    setError(null);
    setInput("");
    const tmpId = `tmp-${Date.now()}`;
    setMsgs((m) => [...m, { id: tmpId, role: "user", content: q }]);
    setStreaming(true);
    const abort = new AbortController();
    abortRef.current = abort;
    const assistantId = `a-${Date.now()}`;
    setMsgs((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);
    try {
      const r = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, threadId, locale }),
        signal: abort.signal,
      });
      if (!r.ok || !r.body) throw new Error("assistant-failed");
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let doneAction: Action | null = null;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const j = JSON.parse(payload) as { token?: string; done?: boolean; threadId?: string; action?: Action | null };
            if (j.threadId) setThreadId(j.threadId);
            if (j.token) {
              const tok = j.token;
              setMsgs((m) => m.map((x) => (x.id === assistantId ? { ...x, content: x.content + tok } : x)));
            }
            if (j.done) {
              doneAction = j.action ?? null;
              if (j.threadId) {
                // Refresh ids/feedback state from server (keeps helpful buttons working).
                fetch(`/api/assistant?threadId=${j.threadId}`)
                  .then((x) => x.json())
                  .then((jj) => {
                    if (jj.ok) setMsgs(jj.messages);
                  })
                  .catch(() => {});
              }
            }
          } catch {}
        }
      }
      void doneAction;
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(te("somethingWrong"));
      setMsgs((m) => m.filter((x) => x.id !== assistantId || x.content));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function mic() {
    const stt = getSTT();
    if (!stt.supported) {
      setError(te("somethingWrong"));
      return;
    }
    setListening(true);
    stt.start(
      locale,
      (tr) => {
        if (tr.final) {
          setListening(false);
          stt.stop();
          if (tr.text.trim()) void ask(tr.text);
        }
      },
      () => setListening(false)
    );
  }

  async function rate(id: string, helpful: boolean) {
    try {
      await fetch("/api/assistant/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messageId: id, helpful }),
      });
      setMsgs((m) => m.map((x) => (x.id === id ? { ...x, feedback: helpful ? 1 : -1 } : x)));
    } catch {}
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-3 pb-40">
      <h1 className="display px-1 pt-4 text-3xl font-bold">{t("title")}</h1>
      <AuthError message={error} />
      <div className="flex flex-col gap-2 px-1" aria-live="polite">
        {msgs.length === 0 && (
          <p className="rounded-[20px] border border-dashed p-6 text-center text-base opacity-70" style={{ borderColor: "var(--border)" }}>
            {t("hint")}
          </p>
        )}
        {msgs.map((m) =>
          m.role === "user" ? (
            <p key={m.id} className="max-w-[85%] self-end rounded-[20px] bg-[var(--indigo)] px-4 py-2.5 text-base font-semibold text-white">
              {m.content}
            </p>
          ) : (
            <div key={m.id} className="flex max-w-[92%] flex-col gap-1 self-start rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
              <p className="text-base">{m.content || "…"}</p>
              {m.action && (
                <Link href={actionHref(m.action)} className="mt-1 inline-block min-h-[48px] self-start rounded-full bg-[var(--turmeric)] px-4 py-2 text-sm font-bold text-[var(--primary-ink)]">
                  {t(`actions.${m.action.name}`)}
                </Link>
              )}
              {m.content && !streaming && (
                <div className="mt-1 flex items-center gap-1">
                  <ListenButton text={m.content} compact />
                  {m.feedback == null && !m.id.startsWith("a-") && (
                    <>
                      <button type="button" onClick={() => void rate(m.id, true)} aria-label="Helpful" className="grid min-h-[48px] min-w-[48px] place-items-center rounded-full border text-lg" style={{ borderColor: "var(--border)" }}>
                        👍
                      </button>
                      <button type="button" onClick={() => void rate(m.id, false)} aria-label="Not helpful" className="grid min-h-[48px] min-w-[48px] place-items-center rounded-full border text-lg" style={{ borderColor: "var(--border)" }}>
                        👎
                      </button>
                    </>
                  )}
                  {m.feedback != null && <span className="text-sm opacity-60">{m.feedback === 1 ? "👍" : "👎"}</span>}
                </div>
              )}
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--card)] px-4 pb-[calc(env(safe-area-inset-bottom)+76px)] pt-2" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
          <div className="flex gap-1 overflow-x-auto">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => void ask(t(`chips.${c}`))}
                disabled={streaming}
                className="shrink-0 rounded-full border-2 px-3 py-2 text-sm font-bold disabled:opacity-50"
                style={{ borderColor: "var(--border)" }}
              >
                {t(`chips.${c}`)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (streaming ? abortRef.current?.abort() : mic())}
              aria-label={streaming ? "Stop" : t("ask")}
              className="grid min-h-[56px] min-w-[56px] shrink-0 place-items-center rounded-full text-[var(--primary-ink)]"
              style={{ background: "var(--turmeric)" }}
            >
              {streaming ? <Square aria-hidden /> : <Mic aria-hidden />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void ask(input);
              }}
              placeholder={t("ask")}
              aria-label={t("ask")}
              maxLength={500}
              className="min-h-[56px] min-w-0 flex-1 rounded-[12px] border-2 bg-transparent px-4 text-base"
              style={{ borderColor: "var(--border)" }}
            />
            <button
              type="button"
              onClick={() => void ask(input)}
              disabled={streaming || !input.trim()}
              aria-label="Send"
              className="grid min-h-[56px] min-w-[56px] shrink-0 place-items-center rounded-full bg-[var(--indigo)] text-white disabled:opacity-50"
            >
              <Send aria-hidden />
            </button>
          </div>
          {listening && <p className="text-center text-sm font-bold" style={{ color: "var(--madder)" }}>● ● ●</p>}
        </div>
      </div>
    </main>
  );
}
