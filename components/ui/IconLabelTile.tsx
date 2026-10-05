"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Icon + short label + audio affordance tile. Never icon-only for critical actions. */
export function IconLabelTile({
  icon,
  label,
  hint,
  onTap,
  selected = false,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  onTap?: () => void;
  selected?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      aria-pressed={selected}
      aria-label={label}
      className="flex min-h-[96px] min-w-[96px] flex-col items-center justify-center gap-1 rounded-[20px] border-2 bg-[var(--card)] px-4 py-3"
      style={{ borderColor: selected ? "var(--turmeric)" : "var(--border)" }}
    >
      <span aria-hidden className="text-3xl">{icon}</span>
      <span className="text-base font-bold leading-tight">{label}</span>
      {hint && <span className="text-sm opacity-70">{hint}</span>}
    </motion.button>
  );
}
