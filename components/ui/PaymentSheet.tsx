import { inr } from "@/lib/utils";

/** Demo-gateway payment sheet skeleton (full flow lands in Phase 4). */
export function PaymentSheet({ total, demo = true }: { total: number; demo?: boolean }) {
  return (
    <div className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--border)" }}>
      {demo && (
        <p className="mb-2 inline-block rounded-full bg-[var(--indigo)] px-3 py-1 text-sm font-bold text-white">
          Demo mode: no real money
        </p>
      )}
      <div className="flex gap-2" role="tablist" aria-label="Payment methods">
        {["UPI", "Card", "Netbanking", "COD"].map((m, i) => (
          <button key={m} role="tab" aria-selected={i === 0} type="button" className="min-h-[56px] flex-1 rounded-[12px] border-2 px-2 text-sm font-bold" style={{ borderColor: i === 0 ? "var(--turmeric)" : "var(--border)" }}>
            {m}
          </button>
        ))}
      </div>
      <p className="display mt-4 text-3xl font-bold">{inr(total)}</p>
    </div>
  );
}
