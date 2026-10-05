"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BigButton } from "@/components/ui/BigButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { ListenButton } from "@/components/voice/ListenButton";
import { AuthError } from "@/components/auth/AuthError";
import { EarningsCounter } from "@/components/ui/EarningsCounter";
import { inr } from "@/lib/utils";

type Payout = {
  id: string;
  orderId: string;
  gross: number;
  fees: { platform: number; gateway: number };
  net: number;
  status: string;
  upiId: string;
};

/** Seller payouts: pending vs settled, withdraw to UPI, demo settlement. */
export default function PayoutsPage() {
  const t = useTranslations("orders");
  const te = useTranslations("auth.errors");
  const [pendingTotal, setPendingTotal] = useState(0);
  const [settledTotal, setSettledTotal] = useState(0);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [upiId, setUpiId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/payouts").then((x) => x.json());
      if (r.ok) {
        setPendingTotal(r.pendingTotal);
        setSettledTotal(r.settledTotal);
        setPayouts(r.payouts);
      } else setError(te("somethingWrong"));
    } catch {
      setError(te("somethingWrong"));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function withdraw() {
    setError(null);
    if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      setError(te("invalidUpi"));
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/payouts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ upiId: upiId.trim() }),
      }).then((x) => x.json());
      if (!r.ok) throw new Error(r.code);
      await load();
    } catch {
      setError(te("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function settle() {
    setBusy(true);
    try {
      await fetch("/api/payouts/settle", { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-32">
      <h1 className="display text-4xl font-bold">{t("payouts")}</h1>
      <EarningsCounter value={settledTotal} label={t("settled")} />
      <div className="rounded-[20px] border bg-[var(--card)] p-5" style={{ borderColor: "var(--turmeric)" }}>
        <p className="text-sm opacity-70">{t("pending")}</p>
        <p className="display text-3xl font-bold">{inr(pendingTotal)}</p>
        <ListenButton text={`${t("pending")}: ${inr(pendingTotal)}. ${t("settled")}: ${inr(settledTotal)}.`} compact />
      </div>
      <AuthError message={error} />
      {pendingTotal > 0 && (
        <>
          <label className="flex flex-col gap-1 text-base font-bold">
            {t("yourUpi")}
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="name@bank"
              autoComplete="off"
              className="min-h-[64px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-lg"
              style={{ borderColor: "var(--border)" }}
            />
          </label>
          <BigButton onClick={withdraw} state={busy ? "loading" : "idle"}>{t("withdraw")}</BigButton>
          <BigButton variant="secondary" onClick={settle}>{t("simulateSettle")}</BigButton>
        </>
      )}
      {payouts.length === 0 ? (
        <p className="rounded-[20px] border border-dashed p-8 text-center text-lg opacity-70" style={{ borderColor: "var(--border)" }}>
          {t("noPayoutsHint")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {payouts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-[12px] border p-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="font-bold">{inr(p.net)}</p>
                <p className="text-xs opacity-70">
                  {inr(p.gross)} − fee {inr(p.fees.gateway)}{p.upiId ? ` · ${p.upiId}` : ""}
                </p>
              </div>
              <StatusPill status={p.status} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
