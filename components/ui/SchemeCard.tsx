export function SchemeCard({ name, benefit, match = false }: { name: string; benefit: string; match?: boolean }) {
  return (
    <article className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
      {match && <p className="mb-1 inline-block rounded-full bg-[var(--leaf)] px-3 py-0.5 text-sm font-bold text-white">Best match</p>}
      <h3 className="display text-xl font-bold">{name}</h3>
      <p className="mt-1 text-base opacity-80">{benefit}</p>
    </article>
  );
}
