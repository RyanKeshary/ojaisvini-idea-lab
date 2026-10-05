"use client";

/**
 * Animated phone mockup playing the Speak → Snap → Sell loop on a CSS timeline.
 * Pure CSS (transform/opacity); still under reduced-motion.
 */
export function PhoneMockup({ speak, snap, sell }: { speak: string; snap: string; sell: string }) {
  const steps = [
    { icon: "🎙️", label: speak },
    { icon: "📷", label: snap },
    { icon: "🏪", label: sell },
  ];
  return (
    <div className="phone-loop mx-auto w-64 rounded-[28px] border-2 bg-[var(--card)] p-4" style={{ borderColor: "var(--border)" }} role="img" aria-label={`${speak} ${snap} ${sell}`}>
      <div className="mx-auto h-5 w-24 rounded-full bg-[var(--mist)]" aria-hidden />
      <div className="mt-3 flex flex-col gap-2">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className="phone-step flex items-center gap-3 rounded-[12px] border p-3"
            style={{ borderColor: "var(--border)", animationDelay: `${i * 1.6}s` }}
          >
            <span aria-hidden className="text-3xl">{s.icon}</span>
            <span className="text-base font-bold">{s.label}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ojas-step { 0%,100% { opacity: .45; transform: none; } 12% { opacity: 1; transform: scale(1.03); } 30% { opacity: 1; } 45%,99% { opacity: .45; } }
        .phone-step { animation: ojas-step 4.8s ease-in-out infinite; }
        [data-motion="reduced"] .phone-step { animation: none; opacity: 1; }
        @media (prefers-reduced-motion: reduce) { .phone-step { animation: none; opacity: 1; } }
      `}</style>
    </div>
  );
}
