"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { inr } from "@/lib/utils";

/** Fake UPI screen: enter amount, send, success. Zero real money, always labelled. */
export function FakeUpi({ onDone }: { onDone?: () => void }) {
  const t = useTranslations("learn");
  const [amount, setAmount] = useState("150");
  const [stage, setStage] = useState<"idle" | "sending" | "done">("idle");
  const n = parseInt(amount || "0", 10);

  function send() {
    if (!Number.isFinite(n) || n < 1) return;
    setStage("sending");
    setTimeout(() => {
      setStage("done");
      onDone?.();
    }, 1200);
  }

  return (
    <div className="rounded-[20px] border-2 border-dashed bg-[var(--card)] p-5" style={{ borderColor: "var(--turmeric)" }} aria-label={t("upiSim")}>
      <p className="text-base font-bold">{t("upiSim")}</p>
      <AnimatePresence mode="wait">
        {stage === "done" ? (
          <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2 py-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--leaf)] text-white" aria-hidden>
              <Check size={32} />
            </span>
            <p className="display text-2xl font-bold">{inr(n)}</p>
            <p className="text-sm opacity-70">{t("upiSuccess")}</p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }} className="flex flex-col gap-2 py-2">
            <label className="flex flex-col gap-1 text-base font-bold">
              {t("upiAmount")}
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                aria-label={t("upiAmount")}
                className="min-h-[64px] rounded-[12px] border-2 bg-transparent px-4 text-2xl font-bold"
                style={{ borderColor: "var(--border)" }}
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[50, 150, 300].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className="min-h-[56px] rounded-[12px] border-2 text-base font-bold"
                  style={{ borderColor: "var(--border)" }}
                >
                  {inr(q)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={send}
              disabled={stage === "sending"}
              className="min-h-[64px] rounded-[20px] bg-[var(--leaf)] text-lg font-bold text-white disabled:opacity-60"
            >
              {stage === "sending" ? "…" : `${t("upiSend")} ${inr(Number.isFinite(n) ? n : 0)}`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
