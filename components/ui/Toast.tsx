"use client";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { id: number; message: string; timerId?: ReturnType<typeof setTimeout> };
let seq = 1;

interface ToastStore {
  toasts: Toast[];
  push: (message: string) => void;
  drop: (id: number) => void;
}

const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (message: string) => {
    const existing = get().toasts.find((t) => t.message === message);
    if (existing) {
      if (existing.timerId) clearTimeout(existing.timerId);
      const timerId = setTimeout(() => get().drop(existing.id), 3500);
      set((s) => ({
        toasts: s.toasts.map((t) => (t.id === existing.id ? { ...t, timerId } : t)),
      }));
      return;
    }

    const id = seq++;
    const timerId = setTimeout(() => get().drop(id), 3500);
    // Keep at most 2 toasts active at any time to avoid screen clutter
    set((s) => ({
      toasts: [...s.toasts.slice(-1), { id, message, timerId }],
    }));
  },
  drop: (id: number) => {
    const target = get().toasts.find((t) => t.id === id);
    if (target?.timerId) clearTimeout(target.timerId);
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export function toast(message: string) {
  useToastStore.getState().push(message);
}

/** Toast viewport with live-region announcements. */
export function ToastViewport() {
  const { toasts, drop } = useToastStore();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] mx-auto flex w-full max-w-md flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={() => drop(t.id)}
            className="pointer-events-auto min-h-[48px] max-w-[90%] rounded-full bg-[var(--ink)] px-5 py-2.5 text-center text-sm sm:text-base font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: "var(--ink)" }}
          >
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

