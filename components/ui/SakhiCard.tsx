export function SakhiCard({ name, area, langs }: { name: string; area: string; langs: string }) {
  return (
    <article className="flex items-center gap-4 rounded-[20px] border bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }}>
      <span aria-hidden className="grid h-14 w-14 place-items-center rounded-full bg-[var(--clay-soft)] text-2xl">👩🏽</span>
      <div>
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-sm opacity-70">{area} · {langs}</p>
      </div>
    </article>
  );
}
