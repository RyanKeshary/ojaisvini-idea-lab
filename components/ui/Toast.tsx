"use client";
import { create } from "zustand";

type Toast = { id: number; message: string };
let seq = 1;

const useToastStore = create<{ toasts: Toast[]; push: (m: string) => void; drop: (id: number) => void }>((set) => ({
  toasts: [],
  push: (message) => set((s) => ({ toasts: [...s.toasts, { id: seq++, message }] })),
  drop: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string) {
  useToastStore.getState().push(message);
}

/** Toast viewport with live-region announcements. */
export function ToastViewport() {
  const { toasts, drop } = useToastStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] mx-auto flex w-full max-w-md flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => drop(t.id)}
          className="pointer-events-auto min-h-[56px] rounded-full bg-[var(--ink)] px-5 py-3 text-base font-bold text-white"
          style={{ background: "var(--ink)" }}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
