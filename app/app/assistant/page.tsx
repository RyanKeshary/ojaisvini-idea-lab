"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mic, Send, Square, RotateCcw, Sparkles } from "lucide-react";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { getSTT } from "@/lib/voice/adapters";
import { usePrefs } from "@/lib/store/prefs";

type Action = { name: string; value: string };
type Msg = { id: string; role: string; content: string; feedback?: number | null; action?: Action | null };

const CHIPS = ["price", "photo", "upi", "scheme", "order", "whatsapp"] as const;

const CHIP_ICONS: Record<string, string> = {
  price: "🏷️",
  photo: "📸",
  upi: "💳",
  scheme: "🏛️",
  order: "📦",
  whatsapp: "💬",
};

function cleanDisplay(content: string): string {
  return content.replace(/(?:\n|^)\s*(?:\*{0,2})ACTION:\s*[a-zA-Z-]+\s*\|\s*[^\n*]+(?:\*{0,2})\s*$/i, "").trim();
}

function actionHref(a: Action): string {
  if (a.name === "open-lesson") {
    const key = a.value.includes("-") ? a.value : "upi-1";
    const journey = key.split("-")[0] || "upi";
    return `/app/learn/${journey}/${key}`;
  }
  if (a.name === "open-scheme") return "/app/schemes";
  if (a.name === "start-create") return "/app/create";
  if (a.name === "show-earnings") return "/app/dashboard";
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

  function startNewChat() {
    if (streaming) abortRef.current?.abort();
    setThreadId(null);
    setMsgs([]);
    setError(null);
  }

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
              if (j.action) {
                setMsgs((m) => m.map((x) => (x.id === assistantId ? { ...x, action: j.action, content: cleanDisplay(x.content) } : x)));
              }
              if (j.threadId) {
                // Refresh ids/feedback state from server
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
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 pb-48 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-3 px-1" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[var(--turmeric)] to-amber-500 text-xl shadow-xs">
              👩‍🏫
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <h1 className="display text-xl sm:text-2xl font-bold tracking-tight text-[var(--fg)] leading-none">{t("title")}</h1>
            <p className="text-xs opacity-60 mt-0.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[var(--turmeric)]" />
              <span>AI Business Mentor · Online</span>
            </p>
          </div>
        </div>

        {msgs.length > 0 && (
          <button
            type="button"
            onClick={startNewChat}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--fg)] opacity-75 hover:opacity-100 hover:bg-[var(--card-hover)] transition-all"
            title="Start new chat"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        )}
      </div>

      <AuthError message={error} />

      {/* Messages Scroll Area */}
      <div className="flex flex-col gap-3.5 px-1" aria-live="polite">
        {msgs.length === 0 && (
          <div className="card-simple p-6 sm:p-7 flex flex-col items-center text-center gap-4 my-2 border-2 border-dashed border-[var(--turmeric)]/30 bg-gradient-to-b from-teal-500/5 to-transparent">
            <div className="relative">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[var(--turmeric)] to-amber-600 text-3xl shadow-sm">
                👩‍🏫
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white text-[10px] text-white font-bold">
                ✓
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--fg)]">{t("title")}</h2>
              <p className="text-xs sm:text-sm opacity-75 max-w-md mt-1 leading-relaxed">
                {t("hint")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-1 text-left">
              {CHIPS.slice(0, 4).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => void ask(t(`chips.${c}`))}
                  disabled={streaming}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--border)] bg-white/80 dark:bg-stone-850 hover:border-[var(--turmeric)] hover:bg-white dark:hover:bg-stone-800 transition-all text-xs font-semibold text-[var(--fg)] shadow-2xs active:scale-[0.98]"
                >
                  <span className="text-base">{CHIP_ICONS[c]}</span>
                  <span className="line-clamp-1">{t(`chips.${c}`)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="max-w-[85%] self-end flex flex-col items-end gap-1">
              <div className="rounded-2xl rounded-tr-xs bg-gradient-to-r from-teal-700 to-teal-800 px-4 py-2.5 text-sm sm:text-base font-medium text-white shadow-xs">
                {m.content}
              </div>
            </div>
          ) : (
            <div
              key={m.id}
              className="flex max-w-[92%] flex-col gap-2 self-start rounded-2xl rounded-tl-xs border bg-[var(--card)] p-4 shadow-xs"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--turmeric)] text-xs font-bold text-white shadow-2xs">
                  👩‍🏫
                </span>
                <span className="text-xs font-bold text-[var(--fg)] opacity-85">Sakhi Didi</span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full">
                  Mentor
                </span>
              </div>

              {/* Message content or typing indicator */}
              {!m.content && streaming ? (
                <div className="flex items-center gap-1.5 py-2 px-1">
                  <span className="h-2 w-2 rounded-full bg-[var(--turmeric)] animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-[var(--turmeric)] animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-[var(--turmeric)] animate-bounce" />
                </div>
              ) : (
                <p className="text-sm sm:text-base leading-relaxed text-[var(--fg)] whitespace-pre-wrap">
                  {cleanDisplay(m.content) || "…"}
                </p>
              )}

              {/* Action Button */}
              {m.action && (
                <Link
                  href={actionHref(m.action)}
                  className="mt-1.5 inline-flex min-h-[40px] items-center gap-2 self-start rounded-full bg-gradient-to-r from-teal-700 to-teal-800 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:opacity-95 active:scale-95 transition-all"
                >
                  <span>→</span>
                  <span>{t.has(`actions.${m.action.name}`) ? t(`actions.${m.action.name}`) : m.action.name}</span>
                </Link>
              )}

              {/* Bottom Actions: Listen + Feedback */}
              {m.content && !streaming && (
                <div className="mt-1 flex items-center justify-between pt-2 border-t border-[var(--border)] border-opacity-50">
                  <ListenButton text={cleanDisplay(m.content)} compact />
                  {m.feedback == null && !m.id.startsWith("a-") && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void rate(m.id, true)}
                        aria-label="Helpful"
                        title="Helpful"
                        className="grid h-7 w-7 place-items-center rounded-full border text-xs transition-colors hover:bg-[var(--card-hover)] border-[var(--border)] active:scale-90"
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        onClick={() => void rate(m.id, false)}
                        aria-label="Not helpful"
                        title="Not helpful"
                        className="grid h-7 w-7 place-items-center rounded-full border text-xs transition-colors hover:bg-[var(--card-hover)] border-[var(--border)] active:scale-90"
                      >
                        👎
                      </button>
                    </div>
                  )}
                  {m.feedback != null && (
                    <span className="text-[11px] font-semibold opacity-60">
                      {m.feedback === 1 ? "👍 Helpful" : "👎 Noted"}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Floating Bottom Input Bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl px-4 pb-[calc(env(safe-area-inset-bottom)+76px)] lg:pb-6 pt-2.5 shadow-lg"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
          {/* Quick Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => void ask(t(`chips.${c}`))}
                disabled={streaming}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-stone-800 text-[var(--fg)] hover:border-[var(--turmeric)] hover:bg-[var(--card-hover)] shadow-2xs active:scale-95 transition-all disabled:opacity-50"
              >
                <span>{CHIP_ICONS[c]}</span>
                <span>{t(`chips.${c}`)}</span>
              </button>
            ))}
          </div>

          {/* Input Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (streaming ? abortRef.current?.abort() : mic())}
              aria-label={streaming ? "Stop" : t("ask")}
              className={`grid min-h-[50px] min-w-[50px] shrink-0 place-items-center rounded-full text-white shadow-md active:scale-95 transition-all ${
                listening ? "bg-red-500 animate-pulse ring-4 ring-red-200" : "bg-[var(--turmeric)] hover:opacity-90"
              }`}
            >
              {streaming ? <Square className="h-5 w-5" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
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
              className="min-h-[50px] min-w-0 flex-1 rounded-2xl border bg-white/70 dark:bg-stone-800/70 px-4 text-sm sm:text-base text-[var(--fg)] focus:outline-hidden focus:ring-2 focus:ring-[var(--turmeric)] transition-all shadow-2xs"
              style={{ borderColor: "var(--border)" }}
            />
            <button
              type="button"
              onClick={() => void ask(input)}
              disabled={streaming || !input.trim()}
              aria-label="Send"
              className="grid min-h-[50px] min-w-[50px] shrink-0 place-items-center rounded-full bg-teal-800 text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              <Send className="h-5 w-5" aria-hidden />
            </button>
          </div>
          {listening && (
            <p className="text-center text-xs font-bold text-red-600 animate-pulse">
              ● Listening to your voice... Speak now
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
