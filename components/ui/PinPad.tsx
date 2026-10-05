"use client";
import { motion } from "framer-motion";
import { Delete } from "lucide-react";

/** Large numeric PIN pad. Dots bounce; wrong PIN shakes (parent sets `errorKey`). */
export function PinPad({ value, onChange, errorKey = 0 }: { value: string; onChange: (v: string) => void; errorKey?: number }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
  return (
    <div>
      <motion.div
        key={errorKey}
        animate={errorKey ? { x: [0, -10, 10, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="mb-4 flex justify-center gap-3"
        role="img"
        aria-label={`${value.length} of 4 digits entered`}
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={`${i}-${value[i] ? "f" : "e"}`}
            initial={value[i] ? { scale: 0.6 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="grid h-5 w-5 place-items-center rounded-full border-2"
            style={{ borderColor: "var(--indigo)", background: value[i] ? "var(--indigo)" : "transparent" }}
          />
        ))}
      </motion.div>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="PIN pad">
        {keys.map((k, i) => (
          <button
            key={i}
            type="button"
            disabled={k === ""}
            aria-label={k === "⌫" ? "Delete" : k || "empty"}
            onClick={() => {
              if (k === "⌫") onChange(value.slice(0, -1));
              else if (value.length < 4) onChange(value + k);
            }}
            className="grid min-h-[64px] place-items-center rounded-[12px] bg-[var(--card)] text-2xl font-bold active:scale-[0.97] disabled:opacity-0"
          >
            {k === "⌫" ? <Delete aria-hidden /> : k}
          </button>
        ))}
      </div>
    </div>
  );
}
