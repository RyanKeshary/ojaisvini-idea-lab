"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { inr } from "@/lib/utils";

/** Odometer-style rolling earnings counter. */
export function EarningsCounter({ value, label = "Earnings" }: { value: number; label?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(value), 200);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div role="img" aria-label={`${label}: ${inr(value)}`} className="rounded-[20px] bg-[var(--card)] p-5">
      <p className="text-sm opacity-70">{label}</p>
      <AnimatePresence mode="popLayout">
        <motion.p
          key={shown}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="display text-4xl font-bold"
        >
          {inr(shown)}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
