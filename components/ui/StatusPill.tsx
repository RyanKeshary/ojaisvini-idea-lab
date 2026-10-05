const colors: Record<string, string> = {
  DRAFT: "var(--mist)",
  LIVE: "var(--leaf)",
  PAUSED: "var(--turmeric)",
  PENDING_PAYMENT: "var(--turmeric)",
  UNPAID: "var(--turmeric)",
  FAILED: "var(--madder)",
  PLACED: "var(--indigo)",
  ACCEPTED: "var(--indigo)",
  PREPARING: "var(--turmeric)",
  READY: "var(--turmeric)",
  PICKED_UP: "var(--indigo)",
  OUT_FOR_DELIVERY: "var(--indigo)",
  PAID: "var(--indigo)",
  COD_PENDING: "var(--turmeric)",
  DELIVERED: "var(--leaf)",
  PENDING: "var(--turmeric)",
  PROCESSING: "var(--indigo)",
  SETTLED: "var(--leaf)",
  CANCELLED: "var(--madder)",
  REFUNDED: "var(--madder)",
  OPEN: "var(--mist)",
  READY_BATCH: "var(--turmeric)",
  COLLECTED: "var(--leaf)",
};

/** Status is never colour-alone: dot + text. */
export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className="inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3 text-sm font-bold"
      style={{ borderColor: "var(--border)" }}
    >
      <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: colors[status] ?? "var(--mist)" }} />
      {status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
