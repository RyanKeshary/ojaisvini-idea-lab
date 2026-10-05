"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mic } from "lucide-react";
import { BigButton } from "@/components/ui/BigButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { queueWrite } from "@/lib/offline/sync";
import { toast } from "@/components/ui/Toast";
import { getSTT, getTTS } from "@/lib/voice/adapters";
import { usePrefs } from "@/lib/store/prefs";

type Reply = {
  id: string;
  text: string;
  audioUrl: string | null;
  author: string;
  authorRole: string | null;
  verified: boolean;
  best: boolean;
  reactions: Record<string, number>;
  myReactions: string[];
};

type Detail = {
  id: string;
  text: string;
  audioUrl: string | null;
  imageUrl: string | null;
  author: string;
  authorRole: string | null;
  mine: boolean;
  bestReplyId: string | null;
  reactions: Record<string, number>;
  myReactions: string[];
};

const REACTS = [
  { kind: "love", icon: "❤️" },
  { kind: "clap", icon: "👏" },
  { kind: "pray", icon: "🙏" },
  { kind: "bulb", icon: "💡" },
];

/** Thread: full post, translate/summarize, replies, best/report. */
export default function ThreadPage() {
  const t = useTranslations("community");
  const te = useTranslations("auth.errors");
  const params = useParams<{ postId: string }>();
  const { locale } = usePrefs();
  const [post, setPost] = useState<Detail | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await fetch(`/api/community/${params.postId}`).then((x) => x.json());
      if (r.ok) {
        setPost(r.post);
        setReplies(r.replies);
      } else setError(te("somethingWrong"));
    } catch {
      setError(te("somethingWrong"));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.postId]);

  function voiceReply() {
    const stt = getSTT();
    if (!stt.supported) return;
    setListening(true);
    stt.start(
      locale,
      (tr) => {
        setText((x) => (x ? `${x} ${tr.text}` : tr.text));
        if (tr.final) {
          setListening(false);
          stt.stop();
        }
      },
      () => setListening(false)
    );
  }

  async function send() {
    if (text.trim().length < 1) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        await queueWrite("reply-create", { postId: params.postId, text: text.trim() });
        setText("");
        toast(t("sendReply") + " ✓");
      } catch {
        setError(te("somethingWrong"));
      }
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/community/${params.postId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      }).then((x) => x.json());
      if (!r.ok) throw new Error("reply-failed");
      setText("");
      await load();
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function react(targetType: string, targetId: string, kind: string) {
    try {
      await fetch("/api/community/react", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetType, targetId, kind }),
      });
      await load();
    } catch {}
  }

  async function markBest(replyId: string) {
    try {
      await fetch("/api/community/best", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId: params.postId, replyId }),
      });
      await load();
    } catch {}
  }

  async function report(targetType: string, targetId: string) {
    try {
      await fetch("/api/community/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason: "user-report" }),
      });
      toast(t("reported"));
    } catch {}
  }

  async function translate() {
    try {
      const r = await fetch("/api/community/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId: params.postId, locale }),
      }).then((x) => x.json());
      if (r.ok) {
        setTranslated(r.text);
        if (r.mocked) toast(t("translate"));
      }
    } catch {}
  }

  async function summarize() {
    try {
      const r = await fetch("/api/community/summarize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId: params.postId }),
      }).then((x) => x.json());
      if (r.ok) setSummary(r.summary);
    } catch {}
  }

  async function speak(text: string) {
    const tts = getTTS();
    if (tts.supported) await tts.speak(text, locale, 1);
  }

  if (!post) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-3 py-6" aria-label={t("title")}>
        <div className="skeleton h-40 rounded-[20px]" />
        <AuthError message={error} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <article className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
        <p className="text-base">{post.text}</p>
        {translated && <p className="mt-2 rounded-[12px] bg-[var(--clay-soft)] p-3 text-base">{translated}</p>}
        {post.audioUrl && <audio src={post.audioUrl} controls preload="none" className="mt-2 h-10 w-full" aria-label="Voice note" />}
        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="mt-2 max-h-64 rounded-[12px] object-cover" />
        )}
        <p className="mt-2 text-sm opacity-70">{post.author} {post.authorRole && `· ${post.authorRole}`}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {REACTS.map((r) => (
            <button
              key={r.kind}
              type="button"
              onClick={() => void react("post", post.id, r.kind)}
              aria-pressed={(post.myReactions || []).includes(r.kind)}
              className="flex min-h-[48px] items-center gap-1 rounded-full border px-3"
              style={{ borderColor: (post.myReactions || []).includes(r.kind) ? "var(--madder)" : "var(--border)" }}
              aria-label={`${r.kind} ${(post.reactions || {})[r.kind] || 0}`}
            >
              <span aria-hidden>{r.icon}</span> {(post.reactions || {})[r.kind] || ""}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={translate} className="min-h-[48px] rounded-full border-2 px-4 text-sm font-bold" style={{ borderColor: "var(--border)" }}>
            {t("translate")}
          </button>
          <button type="button" onClick={summarize} className="min-h-[48px] rounded-full border-2 px-4 text-sm font-bold" style={{ borderColor: "var(--border)" }}>
            {t("summarize")}
          </button>
          <button type="button" onClick={() => void speak(post.text)} className="min-h-[48px] rounded-full border-2 px-4 text-sm font-bold" style={{ borderColor: "var(--border)" }}>
            🔊
          </button>
          <button type="button" onClick={() => void report("post", post.id)} className="min-h-[48px] text-sm font-bold underline" style={{ color: "var(--indigo)" }}>
            {t("report")}
          </button>
        </div>
        {summary && <p className="mt-2 rounded-[12px] bg-[var(--clay-soft)] p-3 text-base whitespace-pre-line">{summary}</p>}
      </article>

      <section aria-label={`${replies.length} ${t("replies")}`} className="flex flex-col gap-2">
        {replies.map((rp) => (
          <article key={rp.id} className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: rp.best ? "var(--leaf)" : "var(--border)" }}>
            <p className="text-base">{rp.text}</p>
            <p className="mt-1 text-sm opacity-70">
              {rp.author} {rp.authorRole && `· ${rp.authorRole}`} {rp.verified && `· ✓ ${t("verified")}`} {rp.best && `· ★ ${t("best")}`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {REACTS.map((r) => (
                <button
                  key={r.kind}
                  type="button"
                  onClick={() => void react("reply", rp.id, r.kind)}
                  aria-pressed={(rp.myReactions || []).includes(r.kind)}
                  className="flex min-h-[48px] items-center gap-1 rounded-full border px-3"
                  style={{ borderColor: (rp.myReactions || []).includes(r.kind) ? "var(--madder)" : "var(--border)" }}
                  aria-label={`${r.kind} ${(rp.reactions || {})[r.kind] || 0}`}
                >
                  <span aria-hidden>{r.icon}</span> {(rp.reactions || {})[r.kind] || ""}
                </button>
              ))}
              {post.mine && !post.bestReplyId && (
                <button type="button" onClick={() => void markBest(rp.id)} className="min-h-[48px] rounded-full border-2 border-dashed px-3 text-sm font-bold" style={{ borderColor: "var(--leaf)" }}>
                  {t("markBest")}
                </button>
              )}
              <button type="button" onClick={() => void report("reply", rp.id)} className="min-h-[48px] px-2 text-sm underline" style={{ color: "var(--indigo)" }}>
                {t("report")}
              </button>
            </div>
          </article>
        ))}
      </section>

      <section aria-label={t("sendReply")} className="flex flex-col gap-2">
        <AuthError message={error} />
        <div className="flex gap-2">
          <input
            id="reply-box"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            placeholder={t("replyHint")}
            aria-label={t("replyHint")}
            maxLength={1000}
            className="min-h-[56px] min-w-0 flex-1 rounded-[12px] border-2 bg-transparent px-4 text-base"
            style={{ borderColor: "var(--border)" }}
          />
          <button type="button" onClick={voiceReply} aria-label={t("sayIt")} className="grid min-h-[56px] min-w-[56px] shrink-0 place-items-center rounded-full border-2" style={{ borderColor: "var(--border)" }}>
            <Mic size={20} aria-hidden />
          </button>
        </div>
        {listening && <p className="text-sm font-bold" style={{ color: "var(--madder)" }}>● ● ●</p>}
        <BigButton onClick={send} state={busy ? "loading" : "idle"}>{t("sendReply")}</BigButton>
      </section>
      <ListenButton text={`${post.text}. ${replies.length} ${t("replies")}.`} />
    </main>
  );
}
