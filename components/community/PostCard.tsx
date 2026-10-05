"use client";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export type FeedPost = {
  id: string;
  room: string;
  type: string;
  text: string;
  audioUrl: string | null;
  imageUrl: string | null;
  author: string;
  authorRole: string | null;
  best: boolean;
  replies: number;
  reactions: Record<string, number>;
};

const KIND_ICON: Record<string, string> = { love: "❤️", clap: "👏", pray: "🙏", bulb: "💡" };

/** Feed card: snippet, counts, quick-thanks, link to thread. */
export function PostCard({ post }: { post: FeedPost }) {
  const t = useTranslations("community");
  const [loved, setLoved] = useState(false);
  const [loveCount, setLoveCount] = useState(post.reactions.love || 0);

  async function quickLove() {
    const next = !loved;
    setLoved(next);
    setLoveCount((c) => c + (next ? 1 : -1));
    try {
      await fetch("/api/community/react", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetType: "post", targetId: post.id, kind: "love" }),
      });
    } catch {}
  }

  return (
    <article className="rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }} aria-label={post.text.slice(0, 60)}>
      <div className="flex items-center gap-2 text-sm">
        <span className="rounded-full bg-[var(--clay-soft)] px-2 py-0.5 font-bold">{post.room}</span>
        <span className="opacity-60">{post.type}</span>
        {post.authorRole && (
          <span className="rounded-full bg-[var(--indigo)] px-2 py-0.5 text-xs font-bold text-white">{post.authorRole}</span>
        )}
      </div>
      <Link href={`/app/community/${post.id}`} className="mt-1 block text-base">
        {post.text.length > 140 ? post.text.slice(0, 140) + "…" : post.text}
      </Link>
      <p className="mt-1 text-sm opacity-70">{post.author}</p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={quickLove}
          aria-pressed={loved}
          aria-label={t("reactHelpful")}
          className="flex min-h-[48px] items-center gap-1 rounded-full border px-3 text-base"
          style={{ borderColor: loved ? "var(--madder)" : "var(--border)" }}
        >
          <span aria-hidden>❤️</span> {loveCount > 0 ? loveCount : ""}
        </button>
        <Link href={`/app/community/${post.id}`} className="text-sm font-bold underline" style={{ color: "var(--indigo)" }} aria-label={`${post.replies} ${t("replies")}`}>
          💬 {post.replies} {t("replies")}
        </Link>
        {Object.entries(post.reactions)
          .filter(([k]) => k !== "love" && KIND_ICON[k])
          .map(([k, n]) => (
            <span key={k} className="text-sm" aria-label={`${k} ${n}`}>
              <span aria-hidden>{KIND_ICON[k]}</span> {n}
            </span>
          ))}
        {post.best && <span className="text-sm font-bold" style={{ color: "var(--leaf)" }}>✓ {t("best")}</span>}
      </div>
    </article>
  );
}
