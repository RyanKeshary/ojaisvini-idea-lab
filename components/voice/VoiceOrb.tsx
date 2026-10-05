"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type OrbState = "idle" | "listening" | "thinking" | "speaking" | "success";

/**
 * Ojas — the living voice orb. Breathes when idle, ripples while
 * listening, orbits while thinking, pulses while speaking, blooms on success.
 * Transform/opacity only; respects reduced motion.
 */
export function VoiceOrb({
  state = "idle",
  size = 120,
  amplitude = 0.5,
  label = "Ojas voice orb",
  onTap,
}: {
  state?: OrbState;
  size?: number;
  amplitude?: number;
  label?: string;
  onTap?: () => void;
}) {
  const glow =
    state === "success"
      ? "radial-gradient(circle at 35% 30%, #7fd6a4, #2F8F5B 70%)"
      : state === "listening"
        ? "radial-gradient(circle at 35% 30%, #ff8ba0, #C4304F 70%)"
        : "radial-gradient(circle at 35% 30%, #ffe3a3, #F2A900 62%, #C4304F 130%)";
  return (
    <button
      type="button"
      aria-label={label}
      data-orb-state={state}
      onClick={onTap}
      className="relative grid place-items-center rounded-full focus-visible:outline-offset-4"
      style={{ width: size, height: size, minWidth: 56, minHeight: 56 }}
    >
      {/* ripples while listening */}
      {state === "listening" && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "var(--madder)" }}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1 + 0.35 * (amplitude + 0.4) + i * 0.18, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
            />
          ))}
        </>
      )}
      {state === "thinking" && (
        <motion.span
          aria-hidden
          className="absolute inset-[-14px] rounded-full"
          style={{ border: "3px dotted var(--indigo)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      )}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: glow, boxShadow: "var(--shadow-float)" }}
        animate={
          state === "idle"
            ? { scale: [1, 1.04, 1] }
            : state === "speaking"
              ? { scale: [1, 1 + 0.08 * amplitude, 1] }
              : state === "success"
                ? { scale: [1, 1.25, 1] }
                : { scale: 1 }
        }
        transition={
          state === "idle"
            ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
            : state === "speaking"
              ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.6 }
        }
      />
      {/* mouth / core */}
      <motion.span
        aria-hidden
        className="relative rounded-full bg-white/80"
        style={{ width: size * 0.22, height: size * 0.22 }}
        animate={state === "speaking" ? { scaleY: [1, 0.4, 1.3, 1] } : { scale: 1 }}
        transition={state === "speaking" ? { duration: 0.5, repeat: Infinity } : {}}
      />
    </button>
  );
}

export function OrbCaption({ state }: { state: OrbState }) {
  const map: Record<OrbState, string> = {
    idle: "●",
    listening: "● ● ●",
    thinking: "…",
    speaking: "♪",
    success: "✓",
  };
  return (
    <span aria-hidden className={cn("text-sm opacity-70")}>
      {map[state]}
    </span>
  );
}
