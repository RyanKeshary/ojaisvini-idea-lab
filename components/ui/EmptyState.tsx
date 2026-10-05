import type { ReactNode } from "react";

/** No dead ends: every empty state offers Try again / Ask Ojas / Call Sakhi. */
export function EmptyState({ icon, title, hint, actions }: { icon?: ReactNode; title: string; hint?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[20px] border border-dashed p-8 text-center" style={{ borderColor: "var(--border)" }}>
      {icon && <span aria-hidden className="text-4xl">{icon}</span>}
      <h3 className="display text-xl font-bold">{title}</h3>
      {hint && <p className="text-base opacity-70">{hint}</p>}
      {actions && <div className="mt-3 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
