export function SkeletonCard({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="rounded-[20px] border p-4" style={{ borderColor: "var(--border)" }}>
      <div className="skeleton aspect-video w-full rounded-[12px]" />
      <div className="skeleton mt-3 h-5 w-2/3 rounded" />
      <div className="skeleton mt-2 h-5 w-1/3 rounded" />
    </div>
  );
}
