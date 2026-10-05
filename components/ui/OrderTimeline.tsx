"use client";
import { motion } from "framer-motion";

const STAGES = [
  "PENDING_PAYMENT",
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "PAYOUT_SETTLED",
] as const;

export type OrderStage = (typeof STAGES)[number];

/** Animated order progression timeline (buyer + seller flows share it). */
export function OrderTimeline({ current }: { current: OrderStage }) {
  const idx = STAGES.indexOf(current);
  // Terminal states outside the line render as a single pill row.
  if (["CANCELLED", "REFUNDED", "FAILED"].includes(current as string)) {
    return (
      <p role="status" className="rounded-[12px] border p-3 text-base font-bold" style={{ borderColor: "var(--madder)", color: "var(--madder)" }}>
        {(current as string).toLowerCase()}
      </p>
    );
  }
  const visible = STAGES.filter((s) => s !== "PENDING_PAYMENT" && s !== "PAYOUT_SETTLED");
  const vIdx = visible.indexOf(current as (typeof visible)[number]);
  return (
    <ol className="flex flex-col gap-1" aria-label={`Order status: ${current}`}>
      {visible.map((s, i) => (
        <li key={s} className="flex items-center gap-3 py-1">
          <motion.span
            aria-hidden
            className="grid h-10 w-10 place-items-center rounded-full border-2 font-bold"
            style={{
              borderColor: i <= vIdx ? "var(--leaf)" : "var(--mist)",
              background: i <= vIdx ? "var(--leaf)" : "transparent",
              color: i <= vIdx ? "#fff" : "var(--fg)",
            }}
            initial={false}
            animate={{ scale: i === vIdx ? [1, 1.15, 1] : 1 }}
          >
            {i < vIdx ? "✓" : i + 1}
          </motion.span>
          <span className="text-base font-semibold">{s.replaceAll("_", " ").toLowerCase()}</span>
        </li>
      ))}
    </ol>
  );
}
