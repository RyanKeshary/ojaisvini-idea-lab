"use client";
import { useRef } from "react";

/** 6-box OTP with auto-advance, paste, autocomplete=one-time-code. */
export function OTPInput({ value, onChange, label = "One-time code" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }).map((_, i) => value[i] ?? "");
  function set(i: number, d: string) {
    const next = (value + "      ").split("").slice(0, 6);
    next[i] = d.replace(/\D/g, "").slice(-1) || "";
    onChange(next.join(""));
    if (d && i < 5) refs.current[i + 1]?.focus();
  }
  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`${label} digit ${i + 1}`}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
          onPaste={(e) => {
            const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (t) { e.preventDefault(); onChange(t); refs.current[Math.min(5, t.length - 1)]?.focus(); }
          }}
          className="h-16 w-full min-w-0 rounded-[12px] border-2 bg-[var(--card)] text-center text-2xl font-bold"
          style={{ borderColor: "var(--border)" }}
        />
      ))}
    </div>
  );
}
