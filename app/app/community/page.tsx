"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Mic } from "lucide-react";
import { PostCard, type FeedPost } from "@/components/community/PostCard";
import { AudioNote } from "@/components/community/AudioNote";
import { Sheet } from "@/components/ui/Sheet";
import { BigButton } from "@/components/ui/BigButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AuthError } from "@/components/auth/AuthError";
import { ListenButton } from "@/components/voice/ListenButton";
import { getSTT } from "@/lib/voice/adapters";
import { usePrefs } from "@/lib/store/prefs";
import { queueWrite } from "@/lib/offline/sync";
import { toast } from "@/components/ui/Toast";

const ROOMS = ["", "food", "craft", "tailor", "dairy", "money", "tech", "wins"] as const;
const TYPES = ["question", "win", "tip"] as const;

/** Women-only forum: rooms, voice/text/photo/audio posts, thanks, threads. */
export default function CommunityPage() {
  const t = useTranslations("community");
  const tc = useTranslations("common");
  const tp = useTranslations("pwa");
  const te = useTranslations("auth.errors");
  const { locale } = usePrefs();
  const [room, setRoom] = useState("");
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composer, setComposer] = useState(false);

  // Composer state.
  const [ctype, setCtype] = useState<(typeof TYPES)[number]>("question");
  const [croom, setCroom] = useState<string>("food");
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [anon, setAnon] = useState(false);
  const [listening, setListening] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (reset: boolean, r: string, s: string, c: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({ sort: s, ...(r ? { room: r } : {}), ...(c ? { cursor: c } : {}) });
        const res = await fetch(`/api/community?${q}`).then((x) => x.json());
        if (res.ok) {
          setPosts((p) => (reset ? res.posts : [...p, ...res.posts]));
          setCursor(res.nextCursor);
        } else setError(te("somethingWrong"));
      } catch {
        setError(te("somethingWrong"));
      } finally {
        setLoading(false);
      }
    },
    [te]
  );

  useEffect(() => {
    void load(true, room, sort, null);
  }, [room, sort, load]);

  function voiceType() {
    const stt = getSTT();
    if (!stt.supported) {
      setError(te("somethingWrong"));
      return;
    }
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

  async function attachPhoto(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const form = new FormData();
    form.append("photo", f);
    try {
      const r = await fetch("/api/upload", { method: "POST", body: form }).then((x) => x.json());
      if (r.url) setPhoto(r.url);
    } catch {}
  }

  async function publish() {
    if (text.trim().length < 2 || publishing) return;
    // Offline: queue the post; it publishes on reconnect.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        await queueWrite("post-create", {
          room: croom, ctype, text: text.trim(),
          imageUrl: photo || undefined, audioUrl: audio || undefined, anon,
        });
        setComposer(false);
        setText("");
        setPhoto(null);
        setAudio(null);
        toast(tp("queuedPublish"));
      } catch {
        setError(te("somethingWrong"));
      }
      return;
    }
    setPublishing(true);
    try {
      const r = await fetch("/api/community", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ room: croom, type: ctype, text: text.trim(), imageUrl: photo || undefined, audioUrl: audio || undefined, anon }),
      }).then((x) => x.json());
      if (!r.ok && !r.id) throw new Error("post-failed");
      setComposer(false);
      setText("");
      setPhoto(null);
      setAudio(null);
      if (r.status === "FLAGGED") toast(t("underReview"));
      await load(true, room, sort, null);
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setPublishing(false);
    }
  }

  const roomLabels = t.raw("rooms") as string[];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 pb-32">
      <h1 className="display text-4xl font-bold">{t("title")}</h1>
      <p className="text-base opacity-75">{t("subtitle")}</p>
      <ListenButton text={`${t("title")}. ${t("subtitle")}`} />
      <AuthError message={error} />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Rooms">
        {ROOMS.map((r, i) => (
          <button
            key={r}
            role="tab"
            aria-selected={room === r}
            onClick={() => setRoom(r)}
            className="min-h-[48px] shrink-0 rounded-full border-2 px-4 text-sm font-bold"
            style={{ borderColor: room === r ? "var(--turmeric)" : "var(--border)" }}
          >
            {roomLabels[i]}
          </button>
        ))}
      </div>
      <div className="flex gap-2" role="tablist" aria-label="Sort">
        {(["latest", "popular"] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={sort === s}
            onClick={() => setSort(s)}
            className="min-h-[48px] rounded-full border-2 px-4 text-sm font-bold"
            style={{ borderColor: sort === s ? "var(--turmeric)" : "var(--border)" }}
          >
            {s === "latest" ? t("latest") : t("popular")}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setComposer(true)}
          className="ml-auto flex min-h-[56px] items-center rounded-full bg-[var(--turmeric)] px-5 text-base font-bold text-[var(--primary-ink)]"
        >
          {t("ask")}
        </button>
      </div>

      {posts.length === 0 && !loading ? (
        <EmptyState
          icon="💬"
          title={t("noPosts")}
          hint={t("noPostsHint")}
          actions={
            <button type="button" onClick={() => setComposer(true)} className="min-h-[56px] rounded-[20px] bg-[var(--turmeric)] px-6 text-lg font-bold text-[var(--primary-ink)]">
              {t("ask")}
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
      {loading && <p className="skeleton h-24 rounded-[20px]" role="status" aria-label="Loading" />}
      {cursor && (
        <button
          type="button"
          onClick={() => void load(false, room, sort, cursor)}
          className="min-h-[56px] self-center text-base font-bold underline"
          style={{ color: "var(--indigo)" }}
        >
          {t("loadMore")}
        </button>
      )}

      <Sheet open={composer} onClose={() => setComposer(false)} title={t("ask")}>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Type">
            {TYPES.map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => setCtype(ty)}
                aria-pressed={ctype === ty}
                className="min-h-[56px] rounded-[12px] border-2 text-sm font-bold capitalize"
                style={{ borderColor: ctype === ty ? "var(--turmeric)" : "var(--border)" }}
              >
                {ty}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Room">
            {ROOMS.slice(1).map((r, i) => (
              <button
                key={r}
                type="button"
                onClick={() => setCroom(r)}
                aria-pressed={croom === r}
                className="min-h-[48px] shrink-0 rounded-full border-2 px-3 text-sm font-bold"
                style={{ borderColor: croom === r ? "var(--turmeric)" : "var(--border)" }}
              >
                {roomLabels[i + 1]}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-base font-bold">
            {t("qLabel")}
            <textarea
              id="post-box"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 1000))}
              rows={4}
              maxLength={1000}
              className="rounded-[12px] border-2 bg-transparent px-3 py-2 text-base"
              style={{ borderColor: "var(--border)" }}
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={voiceType} className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-[12px] border-2 text-base font-bold" style={{ borderColor: "var(--border)" }}>
              <Mic size={18} aria-hidden /> {listening ? "● ● ●" : t("sayIt")}
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="min-h-[56px] flex-1 rounded-[12px] border-2 text-base font-bold" style={{ borderColor: "var(--border)" }}>
              📷 {t("photoOpt").split(" ")[0]}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" aria-hidden onChange={(e) => void attachPhoto(e.target.files)} />
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="max-h-40 rounded-[12px] object-cover" />
          )}
          <AudioNote onReady={setAudio} />
          <label className="flex min-h-[56px] items-center gap-3 text-base font-bold">
            <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="h-6 w-6 accent-[var(--turmeric)]" />
            {t("postAs")}: {anon ? t("anon") : t("me")}
          </label>
          <BigButton onClick={publish} state={publishing ? "loading" : "idle"}>{t("publish")}</BigButton>
          <button type="button" onClick={() => setComposer(false)} className="min-h-[48px] text-base font-bold underline" style={{ color: "var(--indigo)" }}>
            {tc("cancel")}
          </button>
        </div>
      </Sheet>
    </main>
  );
}
