"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { BigButton } from "@/components/ui/BigButton";
import { OTPInput } from "@/components/ui/OTPInput";
import { AuthError } from "@/components/auth/AuthError";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { luhnValid, validUpiId } from "@/lib/payments/luhn";
import { inr } from "@/lib/utils";

type Method = "UPI" | "CARD" | "NETBANKING" | "COD";
type Stage = "summary" | "method" | "processing" | "otp" | "poll" | "done" | "failed" | "cod";

const BANKS = ["State Bank", "HDFC", "ICICI", "Bank of Maharashtra", "Post Office", "Other"];

export default function PayPage() {
  const t = useTranslations("shop");
  const te = useTranslations("auth.errors");
  const params = useParams<{ slug: string; orderId: string }>();
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [shopName, setShopName] = useState("");
  const [stage, setStage] = useState<Stage>("summary");
  const [method, setMethod] = useState<Method>("UPI");
  const [upiId, setUpiId] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [bank, setBank] = useState(BANKS[0]);
  const [otp, setOtp] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const idemKey = useMemo(() => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())), []);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!params?.orderId) return;
    fetch(`/api/pay/order/${params.orderId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setTotal(j.order.total);
          setShopName(j.order.shopName);
          if (j.order.payStatus === "PAID") setStage("done");
        } else {
          setError(te("somethingWrong"));
        }
      })
      .catch(() => setError(te("somethingWrong")));
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [params?.orderId, te]);

  useEffect(() => {
    if (method === "UPI" && stage === "method" && total > 0) {
      QRCode.toDataURL(`upi://pay?pa=ojas@demo&pn=Ojasvini&am=${total}&cu=INR`, { width: 220, margin: 1 })
        .then(setQr)
        .catch(() => setQr(null));
    }
  }, [method, stage, total]);

  async function attempt() {
    setError(null);
    setReason(null);
    if (method === "UPI" && !validUpiId(upiId)) {
      setError(te("invalidUpi"));
      return;
    }
    if (method === "CARD") {
      if (!luhnValid(card)) {
        setError(te("invalidCard"));
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvv)) {
        setError(te("invalidCard"));
        return;
      }
    }
    setBusy(true);
    setStage("processing");
    try {
      const details =
        method === "UPI"
          ? { upiId: upiId.trim() }
          : method === "CARD"
            ? { cardNumber: card.replace(/\D/g, ""), expiry, cvv, name: cardName }
            : method === "NETBANKING"
              ? { bank }
              : {};
      const r = await fetch("/api/pay/attempt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: params.orderId, method, details, idemKey }),
      });
      const j = (await r.json()) as { ok?: boolean; next?: string; paymentId?: string; reason?: string; approveInMs?: number };
      if (!r.ok || !j.ok || !j.paymentId) {
        setReason(j.reason || te("somethingWrong"));
        setStage("failed");
        return;
      }
      setPaymentId(j.paymentId);
      if (j.next === "done") setStage("done");
      else if (j.next === "otp") setStage("otp");
      else if (j.next === "poll") {
        setStage("poll");
        startPoll(j.paymentId);
      } else if (j.next === "cod") setStage("cod");
      else {
        setReason(j.reason || te("somethingWrong"));
        setStage("failed");
      }
    } catch {
      setReason(te("somethingWrong"));
      setStage("failed");
    } finally {
      setBusy(false);
    }
  }

  function startPoll(pid: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/pay/status/${pid}`).then((x) => x.json()) as { status?: string };
        if (r.status === "PAID") {
          if (pollRef.current) clearInterval(pollRef.current);
          setStage("done");
        }
      } catch {}
    }, 1500);
    // Safety: stop polling after 30s.
    setTimeout(() => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 30000);
  }

  async function submitOtp() {
    if (!paymentId) return;
    setBusy(true);
    try {
      const r = await fetch("/api/pay/card-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentId, otp }),
      });
      const j = (await r.json()) as { ok?: boolean; next?: string; reason?: string };
      if (j.next === "done") setStage("done");
      else {
        setReason(j.reason || te("somethingWrong"));
        setStage("failed");
      }
    } catch {
      setReason(te("somethingWrong"));
      setStage("failed");
    } finally {
      setBusy(false);
    }
  }

  const field = "min-h-[64px] rounded-[12px] border-2 bg-[var(--card)] px-4 text-lg";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 pb-16 pt-6">
      <p role="note" className="inline-block self-start rounded-full bg-[var(--indigo)] px-4 py-1.5 text-base font-bold text-white">
        {t("demoPay")}
      </p>
      <h1 className="display text-3xl font-bold">{shopName}</h1>
      <p className="display text-4xl font-bold" role="status">{inr(total)}</p>
      <AuthError message={error} />

      {(stage === "summary" || stage === "method") && (
        <>
          {stage === "summary" && (
            <BigButton disabled={total <= 0} onClick={() => setStage("method")}>
              {total > 0 ? `${t("payNow")} ${inr(total)}` : "..."}
            </BigButton>
          )}
          {stage === "method" && (
            <section className="flex flex-col gap-3" aria-label={t("payNow")}>
              <div className="grid grid-cols-4 gap-1" role="tablist" aria-label="Payment methods">
                {(["UPI", "CARD", "NETBANKING", "COD"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={method === m}
                    onClick={() => setMethod(m)}
                    className="min-h-[56px] rounded-[12px] border-2 px-1 text-xs font-bold"
                    style={{ borderColor: method === m ? "var(--turmeric)" : "var(--border)", background: method === m ? "var(--clay-soft)" : "var(--card)" }}
                  >
                    {m === "UPI" ? t("upi") : m === "CARD" ? t("card") : m === "NETBANKING" ? t("netbanking") : t("cod")}
                  </button>
                ))}
              </div>

              {method === "UPI" && (
                <>
                  <label className="flex flex-col gap-1 text-base font-bold">
                    {t("upiId")}
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@bank" autoComplete="off" className={field} style={{ borderColor: "var(--border)" }} />
                  </label>
                  {qr && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qr} alt="Demo UPI QR" className="h-44 w-44 self-center rounded-[12px] border" style={{ borderColor: "var(--border)" }} />
                  )}
                </>
              )}
              {method === "CARD" && (
                <>
                  <label className="flex flex-col gap-1 text-base font-bold">
                    {t("card")} number
                    <input value={card} onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, "").slice(0, 23))} inputMode="numeric" autoComplete="cc-number" placeholder="4111 1111 1111 1111" className={field} style={{ borderColor: "var(--border)" }} />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-base font-bold">
                      Expiry
                      <input value={expiry} onChange={(e) => setExpiry(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))} inputMode="numeric" autoComplete="cc-exp" placeholder="12/28" className={field} style={{ borderColor: "var(--border)" }} />
                    </label>
                    <label className="flex flex-col gap-1 text-base font-bold">
                      CVV
                      <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="cc-csc" type="password" placeholder="•••" className={field} style={{ borderColor: "var(--border)" }} />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-base font-bold">
                    Name
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} autoComplete="cc-name" maxLength={60} className={field} style={{ borderColor: "var(--border)" }} />
                  </label>
                  <p className="rounded-[12px] bg-[var(--clay-soft)] p-3 text-sm">
                    {t("testCards")}: 4111… success · 4000…0002 declined · 4000…9995 no money
                  </p>
                </>
              )}
              {method === "NETBANKING" && (
                <label className="flex flex-col gap-1 text-base font-bold">
                  {t("chooseBank")}
                  <span className="grid grid-cols-2 gap-2" role="group" aria-label={t("chooseBank")}>
                    {BANKS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBank(b)}
                        aria-pressed={bank === b}
                        className="min-h-[56px] rounded-[12px] border-2 px-2 text-sm font-bold"
                        style={{ borderColor: bank === b ? "var(--turmeric)" : "var(--border)" }}
                      >
                        {b}
                      </button>
                    ))}
                  </span>
                </label>
              )}
              {method === "COD" && <p className="text-base opacity-75">{t("codNote")}</p>}
              <BigButton onClick={attempt} state={busy ? "loading" : "idle"}>{t("payNow")} {inr(total)}</BigButton>
            </section>
          )}
        </>
      )}

      {stage === "processing" && (
        <section className="flex flex-col items-center gap-3 py-10 text-center" aria-label={t("paying")}>
          <VoiceOrb state="thinking" size={120} label={t("paying")} />
          <p className="text-xl font-bold">{t("paying")}</p>
          <p className="text-base opacity-70">Aapka paisa surakshit hai…</p>
        </section>
      )}

      {stage === "poll" && (
        <section className="flex flex-col items-center gap-3 py-10 text-center" aria-label={t("upiWait")}>
          <VoiceOrb state="speaking" size={120} label={t("upiWait")} />
          <p className="text-xl font-bold">{t("upiWait")}</p>
          <p className="text-base opacity-70">(Demo: 4 second mein approve hoga.)</p>
        </section>
      )}

      {stage === "otp" && (
        <section className="flex flex-col gap-3" aria-label={t("cardOtp")}>
          <p className="text-xl font-bold">{t("cardOtp")}</p>
          <OTPInput value={otp} onChange={setOtp} />
          <BigButton onClick={submitOtp} state={busy ? "loading" : "idle"}>{t("payNow")}</BigButton>
        </section>
      )}

      <AnimatePresence>
        {stage === "done" && (
          <motion.section
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-[20px] bg-[var(--leaf)] p-6 text-center text-white"
            aria-label={t("paySuccess")}
          >
            <motion.svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
              <motion.circle cx="36" cy="36" r="32" fill="none" stroke="#fff" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
              <motion.path d="M22 37 l10 10 l18 -20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
            </motion.svg>
            <h2 className="display text-3xl font-bold">{t("paySuccess")}</h2>
            <p className="display text-4xl font-bold">{inr(total)}</p>
            <div className="grid w-full grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => router.push(`/shop/${params.slug}/success/${params.orderId}`)}
                className="min-h-[56px] rounded-[12px] bg-white/20 text-base font-bold"
              >
                {t("receipt")}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/shop/${params.slug}`)}
                className="min-h-[56px] rounded-[12px] bg-white/20 text-base font-bold"
              >
                {t("backToShop")}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {stage === "cod" && (
        <section className="flex flex-col items-center gap-3 rounded-[20px] border-2 p-6 text-center" style={{ borderColor: "var(--leaf)" }} aria-label={t("cod")}>
          <h2 className="display text-2xl font-bold">{t("cod")}</h2>
          <p className="text-base opacity-75">{t("codNote")}</p>
          <BigButton variant="secondary" onClick={() => router.push(`/shop/${params.slug}/success/${params.orderId}`)}>{t("receipt")}</BigButton>
        </section>
      )}

      {stage === "failed" && (
        <motion.section
          initial={{ x: 0 }}
          animate={{ x: [0, -10, 10, -6, 6, 0] }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3 rounded-[20px] border-2 p-6 text-center"
          style={{ borderColor: "var(--madder)" }}
          role="alert"
          aria-label={t("payFailed")}
        >
          <h2 className="display text-2xl font-bold">{t("payFailed")}</h2>
          {reason && <p className="text-base opacity-80">{reason}</p>}
          <BigButton onClick={() => { setStage("method"); setReason(null); }}>{t("tryOther")}</BigButton>
        </motion.section>
      )}
    </main>
  );
}
