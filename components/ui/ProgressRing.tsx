"use client";
import { motion } from "framer-motion";

/** Fills with easing; badge sweep on complete. */
export function ProgressRing({
  value,
  size = 88,
  label,
}: {
  value: number; // 0..1
  size?: number;
  label?: string;
}) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const done = value >= 1;
  return (
    <div role="img" aria-label={label ?? `${Math.round(value * 100)} percent`} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--mist)" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={done ? "var(--leaf)" : "var(--turmeric)"}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - Math.min(1, Math.max(0, value))) }}
          transition={{ ease: "easeOut", duration: 0.8 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-lg font-bold">
        {done ? "✓" : `${Math.round(value * 100)}%`}
      </span>
    </div>
  );
}
