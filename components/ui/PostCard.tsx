export function PostCard({ author, text, audio = false }: { author: string; text: string; audio?: boolean }) {
  return (
    <article className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
      <p className="text-sm font-bold opacity-70">{author}</p>
      <p className="mt-1 text-base">{text}</p>
      {audio && <p className="mt-2 text-sm opacity-70" aria-label="Has audio note">🔊 audio note · 0:42</p>}
    </article>
  );
}
