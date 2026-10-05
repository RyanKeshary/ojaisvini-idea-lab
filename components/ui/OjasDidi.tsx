"use client";
import { motion } from "framer-motion";

export type DidiMood = "greeting" | "listening" | "thinking" | "celebrating";

/** Ojas Didi — friendly illustrated guide. Lip-sync-lite via mouth while speaking. */
export function OjasDidi({
  mood = "greeting",
  speaking = false,
  size = 120,
  label = "Ojas Didi guide",
}: {
  mood?: DidiMood;
  speaking?: boolean;
  size?: number;
  label?: string;
}) {
  const mouthH = speaking ? 10 : mood === "celebrating" ? 9 : 4;
  const brow = mood === "thinking" ? "M28 30 L44 34 M76 30 L60 34" : "M28 31 L44 29 M76 31 L60 29";
  return (
    <div role="img" aria-label={label} style={{ width: size, height: size }}>
      <svg viewBox="0 0 104 104" width={size} height={size} aria-hidden>
        {/* hair + saree drape */}
        <circle cx="52" cy="48" r="36" fill="#3a2438" />
        {/* face */}
        <ellipse cx="52" cy="52" rx="26" ry="28" fill="#a9744f" />
        {/* bindi */}
        <circle cx="52" cy="40" r="3.4" fill="#C4304F" />
        {/* brows */}
        <path d={brow} stroke="#2A1B2E" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* eyes */}
        {mood === "celebrating" ? (
          <>
            <path d="M32 50 q6 6 12 0" stroke="#2A1B2E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M60 50 q6 6 12 0" stroke="#2A1B2E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </>
        ) : mood === "listening" ? (
          <>
            <circle cx="38" cy="52" r="3.4" fill="#2A1B2E" />
            <circle cx="66" cy="52" r="3.4" fill="#2A1B2E" />
            <circle cx="39.5" cy="50.5" r="1.1" fill="#fff" />
            <circle cx="67.5" cy="50.5" r="1.1" fill="#fff" />
          </>
        ) : (
          <>
            <ellipse cx="38" cy="52" rx="3" ry="4" fill="#2A1B2E" />
            <ellipse cx="66" cy="52" rx="3" ry="4" fill="#2A1B2E" />
          </>
        )}
        {/* smile / mouth */}
        <motion.ellipse
          cx="52" cy="68" rx="8" ry={mouthH}
          fill="#5b2333"
          animate={speaking ? { scaleY: [1, 0.4, 1.4, 1] } : { scaleY: 1 }}
          transition={speaking ? { duration: 0.45, repeat: Infinity } : {}}
          style={{ originX: "52px", originY: "68px" }}
        />
        {/* saree border */}
        <path d="M16 78 Q52 100 88 78 L88 92 Q52 110 16 92 Z" fill="#C4304F" />
        <path d="M16 78 Q52 100 88 78" stroke="#F2A900" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );
}
