import type { ReactNode } from "react";

/** Friendly voiced error box. Never blames the user; always pairs with recovery. */
export function AuthError({ message, action }: { message: string | null; action?: ReactNode }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-[12px] border-2 p-4" style={{ borderColor: "var(--madder)" }}>
      <p className="text-base font-bold" style={{ color: "var(--madder)" }}>{message}</p>
      {action && <div className="mt-2 flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
