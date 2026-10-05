/** Animated stepper dots for register wizard etc. */
export function StepDots({ total, current, label }: { total: number; current: number; label?: string }) {
  return (
    <div className="flex items-center gap-2" role="img" aria-label={label ?? `Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-3 rounded-full transition-all"
          style={{
            width: i === current ? 32 : 12,
            background: i <= current ? "var(--turmeric)" : "var(--mist)",
          }}
        />
      ))}
    </div>
  );
}
