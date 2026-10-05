"use client";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { usePrefs } from "@/lib/store/prefs";

/**
 * Marigold-style petal burst (turmeric/madder/indigo).
 * Petals are random per burst, so rendering is gated behind mount:
 * SSR emits the empty shell and the client fills it after hydration,
 * keeping server/client HTML identical (no hydration mismatch).
 * Low-data mode skips the burst entirely.
 */
export function ConfettiBurst({ fire = true, count = 36 }: { fire?: boolean; count?: number }) {
  const [mounted, setMounted] = useState(false);
  const dataSaver = usePrefs((s) => s.dataSaver);
  useEffect(() => setMounted(true), []);
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
        dist: 90 + Math.random() * 90,
        color: ["#F2A900", "#C4304F", "#2E3A87"][i % 3],
        size: 8 + Math.random() * 8,
      })),
    [count]
  );
  if (!fire || !mounted || dataSaver) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size * 0.7, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(p.angle) * p.dist, y: Math.sin(p.angle) * p.dist, opacity: 0, scale: 0.4, rotate: 180 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
